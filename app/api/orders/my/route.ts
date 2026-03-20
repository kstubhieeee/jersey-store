import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const rows = await Order.find({
    clerkUserId: userId,
    status: { $ne: "cancelled" },
  })
    .sort({ createdAt: -1 })
    .limit(80)
    .select({
      totalPaise: 1,
      status: 1,
      createdAt: 1,
      items: 1,
      deliveryStatus: 1,
      trackingUrl: 1,
      awbCode: 1,
      shiprocketShipmentId: 1,
      shiprocketNote: 1,
      customerName: 1,
      storeUsername: 1,
    })
    .lean();

  const orders = rows.map((o) => ({
    id: String(o._id),
    createdAt: o.createdAt,
    status: o.status,
    totalPaise: o.totalPaise,
    itemCount: (o.items ?? []).reduce((s, x) => s + x.quantity, 0),
    deliveryStatus: o.deliveryStatus || "",
    trackingUrl: o.trackingUrl || "",
    awbCode: o.awbCode || "",
    hasShipment: Boolean(o.shiprocketShipmentId),
    shiprocketNote: o.shiprocketNote || "",
    customerName: String((o as { customerName?: string }).customerName ?? "").trim(),
    storeUsername: String((o as { storeUsername?: string }).storeUsername ?? "").trim(),
  }));

  return NextResponse.json({ orders });
}
