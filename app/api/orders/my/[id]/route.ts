import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { refreshOrderShipmentStatus } from "@/lib/shiprocket-fulfillment";
import {
  orderToDetailPublic,
  type LeanOrderForDetail,
} from "@/lib/order-detail-public";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await connectDB();
  const o = await Order.findOne({ _id: id, clerkUserId: userId }).lean();
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ order: orderToDetailPublic(o as LeanOrderForDetail) });
}

export async function POST(_req: Request, { params }: Ctx) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await connectDB();
  const owned = await Order.findOne({ _id: id, clerkUserId: userId }).select({
    _id: 1,
    status: 1,
    shiprocketShipmentId: 1,
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (owned.status !== "paid")
    return NextResponse.json({ error: "Tracking after payment only" }, { status: 400 });
  if (!owned.shiprocketShipmentId)
    return NextResponse.json({ error: "Shipment not booked yet" }, { status: 400 });

  await refreshOrderShipmentStatus(String(owned._id));
  const fresh = await Order.findOne({ _id: id, clerkUserId: userId }).lean();
  if (!fresh) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order: orderToDetailPublic(fresh as LeanOrderForDetail) });
}
