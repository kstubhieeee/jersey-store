import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models";
import type { OrderDocLike } from "@/lib/order-types";
import {
  refreshOrderShipmentStatus,
  shiprocketConfigured,
  shiprocketCreateAdhocOrder,
} from "@/lib/shiprocket-fulfillment";

const CONFIG_HINT =
  "Add SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_PICKUP_LOCATION for delivery API";

function shouldSetConfigOnlyNote(current: string): boolean {
  const t = current.trim();
  return !t || t === CONFIG_HINT;
}

export async function ensureShiprocketForPaidOrder(mongoOrderId: string) {
  await connectDB();
  const order = await Order.findById(mongoOrderId);
  if (!order || order.status !== "paid") return;

  if (order.shiprocketShipmentId) {
    await refreshOrderShipmentStatus(mongoOrderId);
    return;
  }

  if (!shiprocketConfigured()) {
    const doc = await Order.findById(mongoOrderId).select({ shiprocketNote: 1 }).lean();
    const note = String((doc as { shiprocketNote?: string })?.shiprocketNote ?? "");
    if (shouldSetConfigOnlyNote(note)) {
      await Order.findByIdAndUpdate(mongoOrderId, {
        $set: { shiprocketNote: CONFIG_HINT },
      });
    }
    return;
  }

  const plain = order.toObject() as unknown as OrderDocLike;
  const r = await shiprocketCreateAdhocOrder(plain);
  if (!r.ok) {
    await Order.findByIdAndUpdate(mongoOrderId, { $set: { shiprocketNote: r.note } });
    return;
  }

  await Order.findByIdAndUpdate(mongoOrderId, {
    $set: {
      shiprocketOrderId: r.shiprocketOrderId ?? "",
      shiprocketShipmentId: r.shiprocketShipmentId ?? "",
      deliveryStatus: r.deliveryStatus ?? "Created",
      shiprocketNote: "",
    },
  });

  await refreshOrderShipmentStatus(mongoOrderId);
}
