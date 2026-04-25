import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Cart, Jersey } from "@/lib/models";
import { primaryJerseyUrlFromDoc } from "@/lib/jersey-display";
import { stockCap } from "@/lib/stock";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const doc = await Cart.findOne({ clerkUserId: userId });
  if (!doc?.items?.length) return NextResponse.json({ items: [] });

  const kept: typeof doc.items = [] as typeof doc.items;
  for (const item of doc.items) {
    if (await Jersey.exists({ _id: item.jerseyId })) kept.push(item);
  }
  if (kept.length !== doc.items.length) {
    doc.items = kept;
    await doc.save();
  }

  const enriched = await Promise.all(
    doc.items.map(async (item) => {
      const j = await Jersey.findById(item.jerseyId).lean();
      return {
        jerseyId: String(item.jerseyId),
        size: item.size,
        quantity: item.quantity,
        jersey: j
          ? {
              name: j.name,
              image: primaryJerseyUrlFromDoc(j),
              pricePaise: j.pricePaise,
              currency: j.currency,
              sizes: j.sizes,
              piecesInStock: stockCap(j.piecesInStock),
            }
          : null,
      };
    })
  );

  return NextResponse.json({ items: enriched });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const jerseyId = String(body.jerseyId ?? "");
  const size = String(body.size ?? "").trim();
  const rawQ = Number(body.quantity ?? 1);
  const quantity = Number.isFinite(rawQ) ? Math.max(1, Math.floor(rawQ)) : 1;

  if (!mongoose.Types.ObjectId.isValid(jerseyId) || !size)
    return NextResponse.json({ error: "Bad request" }, { status: 400 });

  await connectDB();
  const jersey = await Jersey.findById(jerseyId);
  if (!jersey) return NextResponse.json({ error: "Jersey not found" }, { status: 404 });
  if (!jersey.sizes.includes(size))
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });

  let cart = await Cart.findOne({ clerkUserId: userId });
  if (!cart) cart = await Cart.create({ clerkUserId: userId, items: [] });

  const idx = cart.items.findIndex(
    (i) => String(i.jerseyId) === jerseyId && i.size === size
  );
  if (idx >= 0) cart.items[idx].quantity += quantity;
  else cart.items.push({ jerseyId, size, quantity });

  const cap = stockCap(jersey.piecesInStock);
  if (cap !== null) {
    let total = 0;
    for (const i of cart.items) {
      if (String(i.jerseyId) === jerseyId) total += i.quantity;
    }
    if (total > cap) {
      if (idx >= 0) cart.items[idx].quantity -= quantity;
      else cart.items.pop();
      if (idx >= 0 && cart.items[idx].quantity < 1) cart.items.splice(idx, 1);
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }
  }

  await cart.save();
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const jerseyId = String(body.jerseyId ?? "");
  const size = String(body.size ?? "");
  const rawQty = Number(body.quantity);
  if (!Number.isFinite(rawQty))
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  const quantity = Math.floor(rawQty);

  await connectDB();
  const cart = await Cart.findOne({ clerkUserId: userId });
  if (!cart) return NextResponse.json({ error: "Empty cart" }, { status: 404 });

  const idx = cart.items.findIndex(
    (i) => String(i.jerseyId) === jerseyId && i.size === size
  );
  if (idx < 0) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });

  if (quantity < 1) cart.items.splice(idx, 1);
  else {
    const j = await Jersey.findById(jerseyId);
    const cap = stockCap(j?.piecesInStock);
    if (cap !== null && quantity > cap) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }
    let total = 0;
    for (let i = 0; i < cart.items.length; i++) {
      if (String(cart.items[i].jerseyId) !== jerseyId) continue;
      total += i === idx ? quantity : cart.items[i].quantity;
    }
    if (cap !== null && total > cap)
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    cart.items[idx].quantity = quantity;
  }

  await cart.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Cart.findOneAndUpdate({ clerkUserId: userId }, { items: [] });
  return NextResponse.json({ ok: true });
}
