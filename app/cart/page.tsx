"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { formatInrFromPaise } from "@/lib/catalog-shared";

type Line = {
  jerseyId: string;
  size: string;
  quantity: number;
  jersey: {
    name: string;
    image: string;
    pricePaise: number;
    piecesInStock: number | null;
  } | null;
};

export default function CartPage() {
  const [items, setItems] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (!res.ok) {
      setItems([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setQty(jerseyId: string, size: string, quantity: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jerseyId, size, quantity }),
    });
    load();
  }

  const total = items.reduce(
    (sum, i) => sum + (i.jersey?.pricePaise ?? 0) * i.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8">Cart</h1>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">
            Your cart is empty.{" "}
            <Link href="/" className="text-primary underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <>
            <ul className="space-y-6 mb-10">
              {items.map((line) => {
                const cap = line.jersey?.piecesInStock;
                const totalForJersey =
                  cap == null
                    ? 0
                    : items
                        .filter((i) => i.jerseyId === line.jerseyId)
                        .reduce((s, i) => s + i.quantity, 0);
                const atMax = cap != null && totalForJersey >= cap;
                return (
                <li
                  key={`${line.jerseyId}-${line.size}`}
                  className="flex gap-4 border border-border p-4"
                >
                  <div className="relative h-24 w-20 shrink-0 bg-muted/50">
                    {line.jersey?.image ? (
                      <Image
                        src={line.jersey.image}
                        alt=""
                        fill
                        className="object-contain p-2"
                        unoptimized
                        loading="eager"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {line.jersey?.name ?? "Item"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size {line.size} · ₹
                      {formatInrFromPaise(line.jersey?.pricePaise ?? 0)} each
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="border-foreground/30"
                        onClick={() =>
                          setQty(line.jerseyId, line.size, line.quantity - 1)
                        }
                      >
                        −
                      </Button>
                      <span className="text-sm w-6 text-center">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="border-foreground/30"
                        disabled={atMax}
                        onClick={() =>
                          setQty(line.jerseyId, line.size, line.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    {cap != null ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {atMax
                          ? "All remaining stock is in your cart"
                          : `${Math.max(0, cap - totalForJersey)} left for this product`}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium text-primary shrink-0">
                    ₹
                    {formatInrFromPaise(
                      (line.jersey?.pricePaise ?? 0) * line.quantity
                    )}
                  </p>
                </li>
              );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-border pt-6 mb-6">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-semibold text-primary">
                ₹{formatInrFromPaise(total)}
              </span>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to payment</Link>
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
