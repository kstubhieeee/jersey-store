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

function TrendingJerseyCard({ jersey }: { jersey: JerseyPublic }) {
  const id = String(jersey._id);
  const priceLabel = `₹${formatInrFromPaise(jersey.pricePaise)}`;

  return (
    <Link href={`/product/${id}`} className="group block">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-muted/50">
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
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-sm font-medium text-foreground line-clamp-2">{jersey.name}</span>
        <span className="shrink-0 text-sm font-medium text-primary">{priceLabel}</span>
      </div>
    </Link>
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

  if (jerseys.length === 0) return null;

  return (
    <section className="w-full border-b border-border bg-background">
      <div className="px-6 py-8">
        <h2 className="mb-6 text-xl font-bold text-foreground">Trending Jerseys</h2>
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
    </section>
  );
}
