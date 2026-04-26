import { getTrendingJerseys, getSectionsWithJerseys, getHomeBanners } from "@/lib/catalog";
import { SectionHeader } from "@/components/section-header";
import { SectionHero } from "@/components/section-hero";
import { SectionCatalog } from "@/components/section-catalog";
import { SectionShopBy } from "@/components/section-shop-by";
import { SectionTestimonials } from "@/components/section-testimonials";
import { SectionNewArrivals } from "@/components/section-new-arrivals";
import { homeBanners, homeTestimonials } from "@/config/home-marketing";

export default async function Home() {
  const [trending, catalog, dynamicBanners] = await Promise.all([
    getTrendingJerseys(),
    getSectionsWithJerseys(),
    getHomeBanners(),
  ]);

  const shopLinks = catalog.map((s) => ({
    slug: s.slug,
    name: s.name,
    coverImage: s.coverImage || undefined,
  }));
  const newArrivals = catalog.flatMap((s) => s.jerseys).slice(0, 8);
  const viewAllHref = shopLinks[0] ? `/shop/${shopLinks[0].slug}` : "/";
  const banners = dynamicBanners.length > 0 ? dynamicBanners : homeBanners;

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <SectionHero jerseys={trending} banners={banners} />
      <SectionNewArrivals jerseys={newArrivals} viewAllHref={viewAllHref} />
      <SectionShopBy sections={shopLinks} />
      <SectionCatalog sections={catalog} />
      <SectionTestimonials items={homeTestimonials} />
    </div>
  );
}
