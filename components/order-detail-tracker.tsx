"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OrderDetailPublic } from "@/lib/order-detail-public";
import { formatInrFromPaise } from "@/lib/catalog-shared";

export function OrderDetailTracker({
  orderId,
  initial,
}: {
  orderId: string;
  initial: OrderDetailPublic;
}) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function refresh() {
    setErr("");
    setBusy(true);
    try {
      const r = await fetch(`/api/orders/my/${orderId}`, { method: "POST" });
      const j = (await r.json()) as { order?: OrderDetailPublic; error?: string };
      if (!r.ok) {
        setErr(j.error || "Could not refresh");
        return;
      }
      if (j.order) setData(j.order);
    } finally {
      setBusy(false);
    }
  }

  const when = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="space-y-10">
      <div>
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-primary">
          ← Order history
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">Order</h1>
        <p className="text-xs text-muted-foreground font-mono mb-1">{data.id}</p>
        <p className="text-sm text-muted-foreground">{when}</p>
        <p className="text-xl font-semibold text-primary mt-4">
          ₹{formatInrFromPaise(data.totalPaise)}
        </p>
        <p className="text-sm text-muted-foreground mt-1 capitalize">Payment: {data.status}</p>
        {data.storeUsername ? (
          <p className="text-xs text-muted-foreground mt-1">@{data.storeUsername}</p>
        ) : null}
      </div>

      <div className="rounded border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Delivery</h2>
        {data.deliveryStatus ? (
          <p className="text-foreground font-medium">{data.deliveryStatus}</p>
        ) : data.status === "paid" ? (
          <p className="text-muted-foreground text-sm">
            Booking logistics after payment. Refresh in a moment if empty.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">Shown after payment.</p>
        )}
        {data.courierName ? (
          <p className="text-sm text-muted-foreground">Courier · {data.courierName}</p>
        ) : null}
        {data.awbCode ? (
          <p className="text-sm text-muted-foreground">AWB · {data.awbCode}</p>
        ) : null}
        {data.trackingUrl ? (
          <a
            href={data.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline"
          >
            Open tracking page
          </a>
        ) : null}
        {data.fulfillmentNote ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">{data.fulfillmentNote}</p>
        ) : null}
        {data.shiprocketNote ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">{data.shiprocketNote}</p>
        ) : null}
        {data.status === "paid" && data.shiprocketShipmentId ? (
          <Button type="button" variant="outline" className="border-foreground/30" disabled={busy} onClick={() => void refresh()}>
            {busy ? "Refreshing…" : "Refresh delivery status"}
          </Button>
        ) : null}
        {err ? <p className="text-destructive text-sm">{err}</p> : null}
      </div>

      {data.shippingAddress ? (
        <div className="rounded border border-border p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">Ship to</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {data.shippingAddress.line1}
            {data.shippingAddress.line2 ? `\n${data.shippingAddress.line2}` : ""}
            {`\n${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}`}
            {`\n${data.shippingAddress.country || "India"}`}
            {`\nPhone ${data.shippingAddress.phone}`}
          </p>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Items</h2>
        <ul className="space-y-3">
          {data.items.map((x, i) => (
            <li key={`${x.name}-${x.size}-${i}`} className="text-sm text-muted-foreground">
              {x.quantity}× {x.name} — size {x.size} — ₹{formatInrFromPaise(x.pricePaise)} each
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
