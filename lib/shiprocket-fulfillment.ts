import {
  SHIPROCKET,
  shiprocketHost,
  shiprocketParcelDims,
  shiprocketPickupLocation,
} from "@/config/shiprocket";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import type { OrderDocLike } from "@/lib/order-types";

type TokenCache = { token: string; until: number };
let tokenCache: TokenCache | null = null;

function apiUrl(suffix: string) {
  return `${shiprocketHost()}${SHIPROCKET.basePath}${suffix}`;
}

export async function shiprocketGetToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();
  if (!email || !password) return null;
  const now = Date.now();
  if (tokenCache && tokenCache.until > now) return tokenCache.token;
  const res = await fetch(apiUrl(SHIPROCKET.loginPath), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = (await res.json().catch(() => ({}))) as {
    token?: string;
    expires_in?: number;
    message?: string;
  };
  if (!res.ok || !j.token) return null;
  const sec = Math.max(300, Number(j.expires_in) || 43_200);
  tokenCache = { token: j.token, until: now + sec * 1000 - 120_000 };
  return j.token;
}

export function shiprocketConfigured(): boolean {
  return Boolean(
    shiprocketPickupLocation() && process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD
  );
}

type AdhocResp = {
  order_id?: number;
  shipment_id?: number;
  status?: string;
  status_code?: number;
  message?: string;
};

export async function shiprocketCreateAdhocOrder(order: OrderDocLike): Promise<{
  ok: boolean;
  note: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  deliveryStatus?: string;
}> {
  const token = await shiprocketGetToken();
  const pickup = shiprocketPickupLocation();
  if (!token)
    return {
      ok: false,
      note: "Shiprocket login failed (check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD)",
    };
  if (!pickup)
    return {
      ok: false,
      note: "Missing SHIPROCKET_PICKUP_LOCATION (must match Shiprocket pickup name)",
    };
  const addr = order.shippingAddress;
  if (!addr)
    return { ok: false, note: "Order has no shipping address" };

  const rupeesTotal = Math.max(1, Math.round(order.totalPaise / 100));
  const dims = shiprocketParcelDims();
  const orderIdSr = `CK-${String(order._id).slice(-24)}`.slice(0, 50);
  const orderDate = new Date(order.createdAt ?? Date.now())
    .toISOString()
    .slice(0, 10);
  const fullName = (order.customerName || "Customer").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const first = parts[0] || "Customer";
  const last = parts.length > 1 ? parts.slice(1).join(" ") : first;

  const items = order.items.map((it) => ({
    name: `${it.name} (${it.size})`.slice(0, 200),
    sku: `${it.jerseyId}-${it.size}`.slice(0, 100),
    units: it.quantity,
    selling_price: String(Math.max(1, Math.round(it.pricePaise / 100))),
    discount: "",
    tax: "",
    hsn: "",
  }));

  const body = {
    order_id: orderIdSr,
    order_date: orderDate,
    pickup_location: pickup,
    billing_customer_name: first,
    billing_last_name: last,
    billing_address: addr.line1,
    billing_address_2: addr.line2 || "",
    billing_city: addr.city,
    billing_pincode: Number.parseInt(String(addr.pincode).replace(/\D/g, ""), 10),
    billing_state: addr.state,
    billing_country: addr.country || "India",
    billing_email: order.customerEmail?.includes("@")
      ? order.customerEmail
      : "fulfillment@orders.local",
    billing_phone: Number.parseInt(String(addr.phone).replace(/\D/g, "").slice(-10), 10) || 9999999999,
    shipping_is_billing: true,
    order_items: items,
    payment_method: "Prepaid",
    sub_total: rupeesTotal,
    length: dims.length,
    breadth: dims.breadth,
    height: dims.height,
    weight: dims.weightKg,
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    comment: `Razorpay ${order.razorpayOrderId || ""}`.slice(0, 500),
  };

  const res = await fetch(apiUrl(SHIPROCKET.adhocPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const j = (await res.json().catch(() => ({}))) as AdhocResp & { errors?: unknown };
  if (!res.ok) {
    const msg = j.message || JSON.stringify(j.errors || j);
    return { ok: false, note: `Shiprocket create failed: ${msg}`.slice(0, 2_000) };
  }

  const srOid = j.order_id != null ? String(j.order_id) : "";
  const srSid = j.shipment_id != null ? String(j.shipment_id) : srOid;
  const st =
    typeof j.status === "string"
      ? j.status
      : j.status_code != null
        ? `Code ${j.status_code}`
        : "Created";

  return {
    ok: true,
    note: "",
    shiprocketOrderId: srOid || undefined,
    shiprocketShipmentId: srSid || undefined,
    deliveryStatus: st,
  };
}

type TrackResp = {
  tracking_data?: {
    shipment_status?: string;
    shipment_track?: { awb?: string }[];
    track_url?: string;
  };
  awb_code?: string;
  courier_name?: string;
};

export async function shiprocketTrackShipment(
  shipmentId: string
): Promise<{ status: string; awb: string; courier: string; url: string } | null> {
  const token = await shiprocketGetToken();
  if (!token || !shipmentId) return null;
  const res = await fetch(apiUrl(SHIPROCKET.trackShipmentPath(shipmentId)), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = (await res.json().catch(() => ({}))) as TrackResp & { payload?: TrackResp };
  const pl = j.payload ?? j;
  const td = pl.tracking_data;
  const status =
    td?.shipment_status ||
    (pl as { shipment_status?: string }).shipment_status ||
    "In transit";
  const awb =
    td?.shipment_track?.[0]?.awb ||
    (pl as { awb_code?: string }).awb_code ||
    "";
  const url = td?.track_url || "";
  const courier = (pl as { courier_name?: string }).courier_name || "";
  return { status, awb, courier, url };
}

export async function refreshOrderShipmentStatus(mongoOrderId: string) {
  await connectDB();
  const order = await Order.findById(mongoOrderId).select({ shiprocketShipmentId: 1 });
  const sid = order?.shiprocketShipmentId;
  if (!sid) return null;
  const t = await shiprocketTrackShipment(String(sid));
  if (!t) return null;
  await Order.findByIdAndUpdate(mongoOrderId, {
    $set: {
      deliveryStatus: t.status,
      awbCode: t.awb,
      courierName: t.courier,
      trackingUrl: t.url,
    },
  });
  return t;
}
