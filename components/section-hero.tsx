"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { orderJerseySizes } from "@/config/jersey-sizes";
import type { JerseyPublic } from "@/lib/catalog-shared";
import { formatInrFromPaise, primaryJerseyImage } from "@/lib/catalog-shared";
import { homeBanners } from "@/config/home-marketing";
import { HeroBannerCarousel } from "@/components/hero-banner-carousel";
import { Button } from "@/components/ui/button";
import { productCta } from "@/config/product-cta";
import { landingStyle } from "@/config/landing-style";

function TrendingJerseyCard({ jersey }: { jersey: JerseyPublic }) {
  const id = String(jersey._id);
  const compareAt = jersey.pricePaise + landingStyle.compareAtDeltaPaise;

  return (
    <div className="group flex flex-col">
      <Link href={`/product/${id}`} className="block">
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-muted/50">
          <div className={landingStyle.saleBadgeClass}>
            {landingStyle.saleBadge}
          </div>
          <div className="absolute left-3 top-3 text-[10px] text-muted-foreground">
            {jersey.years || "—"}
          </div>
          <div className="absolute right-3 top-3 text-[10px] text-muted-foreground">
            {orderJerseySizes(jersey.sizes).join(", ")}
          </div>
          <div className="relative h-full w-full">
            {primaryJerseyImage(jersey) ? (
              <Image
                src={primaryJerseyImage(jersey)}
                alt={jersey.name}
                fill
                className="object-contain p-8 transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
                loading="eager"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No photo
              </div>
            )}
          </div>
        </div>
        <div className="mt-3">
          <span className="line-clamp-2 text-sm font-medium text-foreground">{jersey.name}</span>
          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-foreground line-through opacity-75">
              Rs. {formatInrFromPaise(compareAt)}
            </span>
            <span className="font-semibold text-red-500">
              Rs. {formatInrFromPaise(jersey.pricePaise)}
            </span>
          </div>
        </div>
      </Link>
      <Button
        asChild
        size="sm"
        className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Link href={`/product/${id}`}>{productCta.buyNow}</Link>
      </Button>
    </div>
  );
}

export function SectionHero({ jerseys }: { jerseys: JerseyPublic[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", () => onSelect(api));
  }, [api, onSelect]);

  return (
    <section className="w-full border-b border-border bg-background">
      <HeroBannerCarousel banners={homeBanners} />
      {jerseys.length > 0 ? (
        <div className="px-6 py-8">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#232323]" />
            <h2 className="text-xl font-bold text-foreground">Trending Jerseys</h2>
            <div className="h-px w-12 bg-[#232323]" />
          </div>
          <Carousel opts={{ loop: true, align: "start" }} setApi={setApi} className="w-full">
            <CarouselContent className="-ml-4">
              {jerseys.map((jersey) => (
                <CarouselItem
                  key={String(jersey._id)}
                  className="basis-[280px] pl-4 md:basis-[320px]"
                >
                  <TrendingJerseyCard jersey={jersey} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 border-foreground/30 bg-background/80 text-foreground hover:bg-foreground/10 hover:text-foreground md:left-4" />
            <CarouselNext className="right-2 border-foreground/30 bg-background/80 text-foreground hover:bg-foreground/10 hover:text-foreground md:right-4" />
          </Carousel>
          <div className="mt-4 flex justify-center gap-1.5">
            {jerseys.map((j, i) => (
              <button
                key={String(j._id)}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === current ? "bg-foreground" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
