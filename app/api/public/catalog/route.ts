import { NextResponse } from "next/server";
import { getSectionsWithJerseys, getFeaturedJerseys } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sections, featured] = await Promise.all([
      getSectionsWithJerseys(),
      getFeaturedJerseys(),
    ]);
    return NextResponse.json({ sections, featured });
  } catch {
    return NextResponse.json({ error: "Catalog unavailable" }, { status: 500 });
  }
}
