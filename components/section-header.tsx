"use client";

import Link from "next/link";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { TShirt, ShoppingBag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function SectionHeader() {
  const { isSignedIn } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      setCartCount(0);
      return;
    }
    let cancelled = false;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d.items) return;
        const n = d.items.reduce(
          (acc: number, x: { quantity: number }) => acc + x.quantity,
          0
        );
        setCartCount(n);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <TShirt className="size-6" weight="fill" />
          <span className="font-bold text-lg">ClassicKit.</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {isSignedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders" className="text-muted-foreground hover:text-foreground text-sm">
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ShoppingBag className="size-4" />
                  Cart ({cartCount})
                </Link>
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Sign in to cart</span>
          )}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="border-foreground/30">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
