import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import { Cart, Order } from "@/lib/models";
import { PENDING_CHECKOUT_MAX_AGE_MS } from "@/config/checkout";
import { shippingForCreate } from "@/lib/shipping-input";
import { clerkOrderProfile } from "@/lib/clerk-order-profile";
import { buildOrderFromCartLines } from "@/lib/build-order-from-cart";
import { orderItemsMatch } from "@/lib/order-items-compare";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret)
    return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const shipping = shippingForCreate(body);
  if (!shipping)
    return NextResponse.json(
      {
        error:
          "Valid shipping required (10-digit phone, valid 6-digit Indian PIN, full address).",
      },
      { status: 400 }
    );

  await connectDB();
  const cart = await Cart.findOne({ clerkUserId: userId });
  if (!cart?.items?.length)
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });

  const built = await buildOrderFromCartLines(
    cart.items.map((x) => ({
      jerseyId: x.jerseyId,
      size: x.size,
      quantity: x.quantity,
    }))
  );
  if (!built.ok) {
    if (built.code === "CART_STALE")
      return NextResponse.json(
        { error: "Some items are no longer available. Refresh your cart." },
        { status: 400 }
      );
    if (built.code === "STOCK")
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const { orderItems, totalPaise } = built;

  const comparable = orderItems.map((i) => ({
    jerseyId: i.jerseyId,
    size: i.size,
    quantity: i.quantity,
    pricePaise: i.pricePaise,
  }));

  const pending = await Order.findOne({
    clerkUserId: userId,
    status: "pending",
    createdAt: { $gte: new Date(Date.now() - PENDING_CHECKOUT_MAX_AGE_MS) },
  }).sort({ createdAt: -1 });

  if (pending) {
    const plines = pending.items.map((i) => ({
      jerseyId: String(i.jerseyId),
      size: i.size,
      quantity: i.quantity,
      pricePaise: i.pricePaise,
    }));
    if (orderItemsMatch(plines, comparable) && pending.totalPaise === totalPaise) {
      return NextResponse.json({
        orderId: String(pending._id),
        razorpayOrderId: pending.razorpayOrderId,
        amount: totalPaise,
        currency: "INR",
        keyId,
        resumed: true,
      });
    }
    await Order.updateMany(
      { clerkUserId: userId, status: "pending" },
      { $set: { status: "cancelled" } }
    );
  }

  const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const receipt = `c${Date.now().toString(36)}`.slice(0, 40);

  const razorpayOrder = await rz.orders.create({
    amount: totalPaise,
    currency: "INR",
    receipt,
  });

  const p = clerkOrderProfile(await currentUser());

  const order = await Order.create({
    clerkUserId: userId,
    customerEmail: p.customerEmail,
    customerName: p.customerName,
    storeUsername: p.storeUsername,
    shippingAddress: shipping,
    items: orderItems,
    totalPaise,
    currency: "INR",
    razorpayOrderId: razorpayOrder.id,
    status: "pending",
    shiprocketNote: "",
    fulfillmentNote: "",
  });

  return NextResponse.json({
    orderId: String(order._id),
    razorpayOrderId: razorpayOrder.id,
    amount: totalPaise,
    currency: "INR",
    keyId,
    resumed: false,
  });
}
