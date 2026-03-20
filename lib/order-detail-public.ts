import type mongoose from "mongoose";

export type OrderDetailPublic = {
  id: string;
  createdAt?: Date | string;
  status: string;
  totalPaise: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  storeUsername?: string;
  items: {
    name: string;
    size: string;
    quantity: number;
    pricePaise: number;
    image?: string;
  }[];
  shippingAddress: {
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } | null;
  deliveryStatus: string;
  trackingUrl: string;
  awbCode: string;
  courierName: string;
  shiprocketShipmentId: string;
  shiprocketOrderId: string;
  shiprocketNote: string;
  fulfillmentNote: string;
};

export type LeanOrderForDetail = {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date | string;
  status: string;
  totalPaise: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  storeUsername?: string;
  items?: OrderDetailPublic["items"];
  shippingAddress?: OrderDetailPublic["shippingAddress"] | null;
  deliveryStatus?: string;
  trackingUrl?: string;
  awbCode?: string;
  courierName?: string;
  shiprocketShipmentId?: string;
  shiprocketOrderId?: string;
  shiprocketNote?: string;
  fulfillmentNote?: string;
};

export function orderToDetailPublic(o: LeanOrderForDetail): OrderDetailPublic {
  const items = o.items ?? [];
  const addr = o.shippingAddress;
  return {
    id: String(o._id),
    createdAt: o.createdAt,
    status: o.status,
    totalPaise: o.totalPaise,
    currency: o.currency,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    storeUsername: o.storeUsername || "",
    items: items.map((x) => ({
      name: x.name,
      size: x.size,
      quantity: x.quantity,
      pricePaise: x.pricePaise,
      image: x.image,
    })),
    shippingAddress: addr
      ? {
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
        }
      : null,
    deliveryStatus: o.deliveryStatus || "",
    trackingUrl: o.trackingUrl || "",
    awbCode: o.awbCode || "",
    courierName: o.courierName || "",
    shiprocketShipmentId: o.shiprocketShipmentId || "",
    shiprocketOrderId: o.shiprocketOrderId || "",
    shiprocketNote: o.shiprocketNote || "",
    fulfillmentNote: o.fulfillmentNote || "",
  };
}
