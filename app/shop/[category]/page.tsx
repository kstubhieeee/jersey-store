import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Section } from "@/lib/models";
import { getSectionsWithJerseys } from "@/lib/catalog";
import { SectionHeader } from "@/components/section-header";
import { SectionCatalog } from "@/components/section-catalog";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  await connectDB();
  const section = await Section.findOne({ slug: category }).lean();
  if (!section) return { title: "Shop | ClassicKit" };
  return { title: `${(section as { name: string }).name} | ClassicKit` };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  await connectDB();
  const exists = await Section.findOne({ slug: category }).lean();
  if (!exists) notFound();

  const catalog = await getSectionsWithJerseys();
  const filtered = catalog.filter((s) => s.slug === category);

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="pt-8">
        <SectionCatalog sections={filtered} />
      </main>
    </div>
  );
}
