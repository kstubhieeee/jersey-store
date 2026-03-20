"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { placeholderShippingAllowed } from "@/config/shipping-placeholder";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, fn: (data: { error: { description: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [ship, setShip] = useState({
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const showTestHint = useMemo(() => placeholderShippingAllowed(), []);

  useEffect(() => {
    const ph = user?.primaryPhoneNumber?.phoneNumber;
    if (ph)
      setShip((s) => ({
        ...s,
        phone: ph.replace(/\D/g, "").slice(-10) || s.phone,
      }));
  }, [user?.primaryPhoneNumber?.phoneNumber]);

  const pay = useCallback(async () => {
    setError("");
    setPaying(true);
    try {
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: ship }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || "Could not start payment");
        setPaying(false);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );
        const run = () => {
          const R = window.Razorpay;
          if (!R) {
            reject(new Error("Razorpay failed to load"));
            return;
          }
          const options: Record<string, unknown> = {
            key: createData.keyId,
            amount: createData.amount,
            currency: createData.currency,
            order_id: createData.razorpayOrderId,
            name: "ClassicKit",
            description: "Jersey order",
            handler: async (response: RazorpaySuccess) => {
              const v = await fetch("/api/orders/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: createData.orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const vr = await v.json();
              if (!v.ok) {
                setError(vr.error || "Verification failed");
                setPaying(false);
                return;
              }
              router.push(`/order/success?orderId=${encodeURIComponent(createData.orderId)}`);
            },
            prefill: {
              email: user?.primaryEmailAddress?.emailAddress ?? "",
              name: user?.fullName ?? "",
            },
            theme: { color: "#D4AF37" },
            modal: { ondismiss: () => setPaying(false) },
          };
          const rz = new R(options);
          rz.on("payment.failed", (d: { error: { description: string } }) => {
            setError(d.error?.description || "Payment failed");
            setPaying(false);
          });
          rz.open();
          resolve();
        };
        if (existing) {
          run();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => run();
        script.onerror = () => reject(new Error("Script load error"));
        document.body.appendChild(script);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setPaying(false);
    }
  }, [router, user, ship]);

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Razorpay payment. After payment we book Shiprocket when credentials and pickup are configured
          in the store environment.
        </p>
        {showTestHint ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 rounded border border-border p-2">
            Placeholder shipping is on (SHIPROCKET_ALLOW_PLACEHOLDER_SHIPPING). You can leave fake
            values or still fill the form.
          </p>
        ) : null}
        <div className="space-y-3 mb-8 rounded border border-border p-4">
          <p className="text-sm font-medium text-foreground">Shipping</p>
          <input
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            placeholder="Phone (10 digits)"
            value={ship.phone}
            onChange={(e) => setShip((s) => ({ ...s, phone: e.target.value }))}
          />
          <input
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            placeholder="Address line 1"
            value={ship.line1}
            onChange={(e) => setShip((s) => ({ ...s, line1: e.target.value }))}
          />
          <input
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            placeholder="Address line 2 (optional)"
            value={ship.line2}
            onChange={(e) => setShip((s) => ({ ...s, line2: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              placeholder="City"
              value={ship.city}
              onChange={(e) => setShip((s) => ({ ...s, city: e.target.value }))}
            />
            <input
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              placeholder="State"
              value={ship.state}
              onChange={(e) => setShip((s) => ({ ...s, state: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              placeholder="PIN (6 digits)"
              value={ship.pincode}
              onChange={(e) => setShip((s) => ({ ...s, pincode: e.target.value }))}
            />
            <input
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              placeholder="Country"
              value={ship.country}
              onChange={(e) => setShip((s) => ({ ...s, country: e.target.value }))}
            />
          </div>
        </div>
        {error ? <p className="text-destructive text-sm mb-4">{error}</p> : null}
        <div className="flex flex-col gap-4">
          <Button size="lg" disabled={paying} onClick={() => void pay()}>
            {paying ? "Processing…" : "Pay with Razorpay"}
          </Button>
          <Button variant="outline" className="border-foreground/30" asChild>
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
