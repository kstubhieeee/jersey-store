import { isValidIndiaPincode } from "@/config/shipping-validation";
import { placeholderShippingAllowed, placeholderShippingFromEnv } from "@/config/shipping-placeholder";
import type { ShippingAddressLean } from "@/lib/order-types";

export function normalizeShippingInput(raw: unknown): ShippingAddressLean | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const digits = String(o.phone ?? "").replace(/\D/g, "");
  const phone = digits.length >= 10 ? digits.slice(-10) : "";
  const line1 = String(o.line1 ?? "").trim();
  const line2 = String(o.line2 ?? "").trim();
  const city = String(o.city ?? "").trim();
  const state = String(o.state ?? "").trim();
  const pincode = String(o.pincode ?? "").replace(/\D/g, "").slice(0, 6);
  const country = String(o.country ?? "India").trim() || "India";
  if (!phone || !line1 || !city || !state || !isValidIndiaPincode(pincode)) return null;
  return { phone, line1, line2, city, state, pincode, country };
}

export function shippingForCreate(body: unknown): ShippingAddressLean | null {
  const b = body as { shipping?: unknown } | null;
  const direct = normalizeShippingInput(b?.shipping);
  if (direct) return direct;
  if (placeholderShippingAllowed()) {
    const p = placeholderShippingFromEnv();
    const pin = String(p.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (!isValidIndiaPincode(pin)) return null;
    return { ...p, pincode: pin };
  }
  return null;
}
