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
import type { HomeBanner } from "@/config/home-marketing";

export function HeroBannerCarousel({ banners }: { banners: readonly HomeBanner[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback((carousel: CarouselApi) => {
    if (!carousel) return;
    setCurrent(carousel.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", () => onSelect(api));
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || banners.length <= 1) return;
    const id = window.setInterval(() => api.scrollNext(), 6000);
    return () => window.clearInterval(id);
  }, [api, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full border-b border-border">
      <Carousel opts={{ loop: true, align: "start" }} setApi={setApi} className="w-full">
        <CarouselContent className="-ml-0">
          {banners.map((b) => (
            <CarouselItem key={b.id} className="pl-0 basis-full">
              <BannerSlide banner={b} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-1/2 z-20 -translate-y-1/2 border-border bg-background/90 text-foreground shadow-sm hover:bg-background md:left-6" />
        <CarouselNext className="right-3 top-1/2 z-20 -translate-y-1/2 border-border bg-background/90 text-foreground shadow-sm hover:bg-background md:right-6" />
      </Carousel>
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Banner ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === current ? "bg-primary" : "bg-primary/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function BannerSlide({ banner }: { banner: HomeBanner }) {
  const inner = (
    <div className="relative aspect-[21/9] min-h-[200px] w-full max-h-[420px] sm:min-h-[240px]">
      <Image
        src={banner.src}
        alt={banner.alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-16 md:px-12 md:pb-12">
        <p className="text-lg font-bold text-primary-foreground drop-shadow-sm md:text-2xl">
          {banner.headline}
        </p>
        <p className="mt-1 max-w-xl text-sm text-primary-foreground/90 md:text-base">
          {banner.subline}
        </p>
      </div>
    </div>
  );

  if (banner.href) {
    return (
      <Link href={banner.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {inner}
      </Link>
    );
  }

  return inner;
}
