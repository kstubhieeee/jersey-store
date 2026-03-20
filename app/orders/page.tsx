import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { SectionHeader } from "@/components/section-header";
import { formatInrFromPaise } from "@/lib/catalog-shared";

export default async function OrdersHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
    })
    .lean();

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Your orders</h1>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No orders yet.{" "}
            <Link href="/" className="text-primary underline">
              Shop jerseys
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((o) => {
              const id = String(o._id);
              const qty = (o.items ?? []).reduce((s, x) => s + x.quantity, 0);
              const when = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";
              const del = typeof o.deliveryStatus === "string" ? o.deliveryStatus.trim() : "";
              return (
                <li key={id}>
                  <Link
                    href={`/orders/${id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <p className="text-foreground font-medium">
                        #{id.slice(-6).toUpperCase()} · {qty} item{qty === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {when} ·{" "}
                        <span className="capitalize">{o.status}</span>
                        {del ? ` · ${del}` : ""}
                      </p>
                    </div>
                    <div className="text-primary font-semibold">
                      ₹{formatInrFromPaise(o.totalPaise)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
