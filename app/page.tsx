import { getTrendingJerseys, getSectionsWithJerseys } from "@/lib/catalog";
import { SectionHeader } from "@/components/section-header";
import { SectionHero } from "@/components/section-hero";
import { SectionCatalog } from "@/components/section-catalog";
import { SectionShopBy } from "@/components/section-shop-by";

export default async function Home() {
  const [trending, catalog] = await Promise.all([
    getTrendingJerseys(),
    getSectionsWithJerseys(),
  ]);

  const shopLinks = catalog.map((s) => ({
    slug: s.slug,
    name: s.name,
    coverImage: s.coverImage || undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <SectionHero jerseys={trending} />
      <SectionShopBy sections={shopLinks} />
      <SectionCatalog sections={catalog} />
    </div>
  );
}
