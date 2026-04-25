import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order, Cart, Jersey } from "@/lib/models";
import { stockCap } from "@/lib/stock";
import { ensureShiprocketForPaidOrder } from "@/lib/shiprocket-sync";
import { clerkOrderProfile } from "@/lib/clerk-order-profile";

export const dynamic = "force-dynamic";

const E = {
  NOFIND: "VERIFY_NOFIND",
  STOCK: "VERIFY_STOCK",
} as const;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret)
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

  const body = await req.json();
  const orderId = String(body.orderId ?? "");
  const razorpay_order_id = String(body.razorpay_order_id ?? "");
  const razorpay_payment_id = String(body.razorpay_payment_id ?? "");
  const razorpay_signature = String(body.razorpay_signature ?? "");

  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  )
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  await connectDB();
  const order = await Order.findOne({
    _id: orderId,
    clerkUserId: userId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const storeProfile = clerkOrderProfile(await currentUser());

  if (order.status === "paid") {
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        customerName: storeProfile.customerName || order.customerName || "",
        customerEmail: storeProfile.customerEmail || order.customerEmail || "",
        storeUsername: storeProfile.storeUsername || order.storeUsername || "",
      },
    });
    try {
      await ensureShiprocketForPaidOrder(orderId);
    } catch {
      await Order.findByIdAndUpdate(orderId, {
        $set: { shiprocketNote: "Shiprocket sync threw—check server logs" },
      });
    }
    return NextResponse.json({ ok: true, orderId: String(order._id) });
  }

  if (order.status !== "pending")
    return NextResponse.json({ error: "Order cannot be paid" }, { status: 400 });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const fresh = await Order.findById(orderId).session(session);
      if (!fresh) throw new Error(E.NOFIND);
      if (fresh.status === "paid") return;
      const missingSkus: string[] = [];
      for (const item of fresh.items) {
        const j = await Jersey.findById(item.jerseyId).session(session);
        if (!j) {
          missingSkus.push(String(item.jerseyId));
          continue;
        }
        if (stockCap(j.piecesInStock) === null) continue;
        const updated = await Jersey.findOneAndUpdate(
          {
            _id: item.jerseyId,
            piecesInStock: { $gte: item.quantity },
          },
          { $inc: { piecesInStock: -item.quantity } },
          { new: true, session }
        );
        if (!updated) throw new Error(E.STOCK);
      }
      fresh.status = "paid";
      fresh.razorpayPaymentId = razorpay_payment_id;
      fresh.customerName = storeProfile.customerName || fresh.customerName || "";
      fresh.customerEmail = storeProfile.customerEmail || fresh.customerEmail || "";
      fresh.storeUsername = storeProfile.storeUsername || fresh.storeUsername || "";
      if (missingSkus.length) {
        const uniq = [...new Set(missingSkus)];
        fresh.fulfillmentNote = `Paid; lines had no catalog match (stock not reduced for those SKUs): ${uniq.join(", ")}`.slice(
          0,
          2000
        );
      }
      await fresh.save({ session });
      await Cart.findOneAndUpdate({ clerkUserId: userId }, { items: [] }).session(
        session
      );
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === E.NOFIND)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (msg === E.STOCK)
      return NextResponse.json({ error: "Stock unavailable" }, { status: 409 });
    return NextResponse.json({ error: "Could not complete order" }, { status: 500 });
  } finally {
    await session.endSession();
  }

  try {
    await ensureShiprocketForPaidOrder(orderId);
  } catch {
    await Order.findByIdAndUpdate(orderId, {
      $set: { shiprocketNote: "Shiprocket sync threw—check server logs" },
    });
  }

  return NextResponse.json({ ok: true, orderId: String(order._id) });
}
