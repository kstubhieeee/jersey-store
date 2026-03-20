import { Jersey } from "@/lib/models";
import { primaryJerseyUrlFromDoc } from "@/lib/jersey-display";
import { stockCap } from "@/lib/stock";

type CartLine = {
  jerseyId: unknown;
  size: string;
  quantity: number;
};

export type BuiltOrderLine = {
  jerseyId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  pricePaise: number;
};

export type BuildOrderResult =
  | { ok: true; orderItems: BuiltOrderLine[]; totalPaise: number }
  | { ok: false; code: "CART_STALE" | "STOCK" | "EMPTY" };

export async function buildOrderFromCartLines(
  lines: CartLine[]
): Promise<BuildOrderResult> {
  const byJersey = new Map<string, number>();
  for (const line of lines) {
    const jid = String(line.jerseyId);
    byJersey.set(jid, (byJersey.get(jid) ?? 0) + line.quantity);
  }
  for (const [jid, need] of byJersey) {
    const j = await Jersey.findById(jid).lean();
    if (!j) return { ok: false, code: "CART_STALE" };
    const cap = stockCap(j.piecesInStock);
    if (cap !== null && need > cap) return { ok: false, code: "STOCK" };
  }

  let totalPaise = 0;
  const orderItems: BuiltOrderLine[] = [];
  for (const line of lines) {
    const j = await Jersey.findById(line.jerseyId).lean();
    if (!j) return { ok: false, code: "CART_STALE" };
    const lineTotal = j.pricePaise * line.quantity;
    totalPaise += lineTotal;
    orderItems.push({
      jerseyId: String(j._id),
      name: j.name,
      image: primaryJerseyUrlFromDoc(j),
      size: line.size,
      quantity: line.quantity,
      pricePaise: j.pricePaise,
    });
  }

  if (orderItems.length === 0 || totalPaise < 1)
    return { ok: false, code: "EMPTY" };

  return { ok: true, orderItems, totalPaise };
}
