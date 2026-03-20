"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { TShirt } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { orderJerseySizes } from "@/config/jersey-sizes";

type Props = {
  jerseyId: string;
  sizes: readonly string[];
  piecesInStock: number | null;
};

export function ProductActions({ jerseyId, sizes, piecesInStock }: Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const orderedSizes = useMemo(() => orderJerseySizes(sizes), [sizes]);
  const [size, setSize] = useState(() => orderedSizes[0] ?? "");
  const [busy, setBusy] = useState(false);
  const tracked = piecesInStock !== null;
  const out = tracked && piecesInStock <= 0;
  const fewLeft = tracked && piecesInStock > 0 && piecesInStock <= 5;

  useEffect(() => {
    setSize((prev) =>
      prev && orderedSizes.includes(prev) ? prev : orderedSizes[0] ?? ""
    );
  }, [orderedSizes]);

  async function addToCart() {
    if (!size) return;
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jerseyId, size, quantity: 1 }),
      });
      if (res.ok) router.push("/cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {tracked ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {out
            ? "Out of stock"
            : fewLeft
              ? `Only ${piecesInStock} left in stock`
              : `${piecesInStock} in stock`}
        </p>
      ) : null}
      <div className="mb-6">
        <span className="mb-2 block text-sm text-muted-foreground">Size</span>
        <div className="flex flex-wrap gap-2">
          {orderedSizes.map((s) => (
            <Button
              key={s}
              type="button"
              variant={size === s ? "default" : "outline"}
              size="sm"
              className={`min-h-11 min-w-11 rounded-full px-4 ${
                size === s ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-foreground/30"
              }`}
              onClick={() => setSize(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-col sm:flex-row gap-4">
        {isSignedIn ? (
          <Button
            className="flex-1"
            size="lg"
            disabled={busy || !size || out}
            onClick={addToCart}
          >
            {busy ? "Adding…" : out ? "Sold out" : "Add to Cart"}
          </Button>
        ) : (
          <SignInButton mode="modal">
            <Button className="flex-1" size="lg" disabled={!size || out}>
              Sign in to add to cart
            </Button>
          </SignInButton>
        )}
        <Button variant="outline" size="lg" className="border-foreground/30" asChild>
          <Link href="/">
            <TShirt className="size-5 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </>
  );
}
