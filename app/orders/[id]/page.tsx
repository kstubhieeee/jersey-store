import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { SectionHeader } from "@/components/section-header";
import { OrderDetailTracker } from "@/components/order-detail-tracker";
import { orderToDetailPublic, type LeanOrderForDetail } from "@/lib/order-detail-public";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const o = await Order.findOne({ _id: id, clerkUserId: userId }).lean();
  if (!o) notFound();

  const initial = orderToDetailPublic(o as LeanOrderForDetail);

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <OrderDetailTracker orderId={id} initial={initial} />
      </main>
    </div>
  );
}
