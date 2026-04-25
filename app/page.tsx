import { getTrendingJerseys, getSectionsWithJerseys } from "@/lib/catalog";
import { SectionHeader } from "@/components/section-header";
import { SectionHero } from "@/components/section-hero";
import { SectionCatalog } from "@/components/section-catalog";
import { SectionShopBy } from "@/components/section-shop-by";
import { SectionTestimonials } from "@/components/section-testimonials";
import { SectionNewArrivals } from "@/components/section-new-arrivals";
import { homeTestimonials } from "@/config/home-marketing";

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
  const newArrivals = catalog.flatMap((s) => s.jerseys).slice(0, 8);
  const viewAllHref = shopLinks[0] ? `/shop/${shopLinks[0].slug}` : "/";

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <SectionHero jerseys={trending} />
      <SectionNewArrivals jerseys={newArrivals} viewAllHref={viewAllHref} />
      <SectionShopBy sections={shopLinks} />
      <SectionCatalog sections={catalog} />
      <SectionTestimonials items={homeTestimonials} />
    </div>
  );
}
