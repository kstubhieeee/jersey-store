import Link from "next/link";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { SectionHeader } from "@/components/section-header";
import { formatInrFromPaise } from "@/lib/catalog-shared";

type Props = { searchParams: Promise<{ orderId?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { orderId } = await searchParams;
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) redirect("/");

  await connectDB();
  const order = await Order.findOne({
    _id: orderId,
    clerkUserId: userId,
    status: "paid",
  }).lean();

  if (!order) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Order confirmed</h1>
        <p className="text-muted-foreground text-sm mb-2">
          Thank you. Payment received.
        </p>
        <p className="text-xs text-muted-foreground mb-8 font-mono">
          Order #{String(order._id)}
        </p>
        <p className="text-lg font-semibold text-primary mb-10">
          ₹{formatInrFromPaise(order.totalPaise)}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex h-9 items-center justify-center px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Track order
          </Link>
          <Link
            href="/orders"
            className="inline-flex h-9 items-center justify-center px-4 text-sm font-medium border border-border text-foreground hover:bg-muted"
          >
            All orders
          </Link>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center px-4 text-sm font-medium border border-border text-foreground hover:bg-muted"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
