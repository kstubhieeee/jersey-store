"use client";

import { useCallback, useEffect, useState } from "react";
import { QuotesIcon } from "@phosphor-icons/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { HomeTestimonial } from "@/config/home-marketing";

export function SectionTestimonials({
  items,
}: {
  items: readonly HomeTestimonial[];
}) {
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
    if (!api || items.length <= 1) return;
    const id = window.setInterval(() => api.scrollNext(), 8000);
    return () => window.clearInterval(id);
  }, [api, items.length]);

  if (items.length === 0) return null;

  return (
    <section className="w-full border-t border-border bg-muted/40 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-xl font-bold text-foreground md:text-2xl">
          What fans say
        </h2>
        <div className="relative px-10 md:px-14">
          <Carousel opts={{ loop: true, align: "center" }} setApi={setApi} className="w-full">
            <CarouselContent>
              {items.map((t) => (
                <CarouselItem key={t.id} className="basis-full">
                  <figure className="mx-auto max-w-2xl text-center">
                    <QuotesIcon
                      className="mx-auto mb-4 size-10 text-primary/80"
                      weight="fill"
                      aria-hidden
                    />
                    <blockquote className="text-base leading-relaxed text-foreground md:text-lg">
                      {t.quote}
                    </blockquote>
                    <figcaption className="mt-6 text-sm">
                      <span className="font-semibold text-foreground">{t.author}</span>
                      <span className="text-muted-foreground"> · {t.role}</span>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-border bg-background text-foreground hover:bg-muted md:-left-2" />
            <CarouselNext className="right-0 border-border bg-background text-foreground hover:bg-muted md:-right-2" />
          </Carousel>
          <div className="mt-8 flex justify-center gap-1.5">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === current ? "bg-primary" : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
