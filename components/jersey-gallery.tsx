"use client";

import Image from "next/image";
import { useState } from "react";
import type { JerseyImagePublic } from "@/lib/catalog-shared";

export function JerseyGallery({
  images,
  productName,
}: {
  images: JerseyImagePublic[];
  productName: string;
}) {
  const list = images.length > 0 ? images : [{ label: "Photo", url: "" }];
  const [active, setActive] = useState(0);
  const main = list[active] ?? list[0];
  const src = main?.url;

  if (!src) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-muted/50 text-sm text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/50">
        <Image
          src={src}
          alt={`${productName} ${main?.label ?? ""}`}
          fill
          className="object-contain p-8"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          loading="eager"
          unoptimized
        />
      </div>
      {list.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {list.map((im, i) => (
            <button
              key={`${im.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-14 border-2 bg-muted/30 transition-colors ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              {im.url ? (
                <Image
                  src={im.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              ) : null}
              <span className="sr-only">{im.label}</span>
            </button>
          ))}
        </div>
      ) : null}
      {list.length > 1 ? (
        <p className="text-center text-xs text-muted-foreground">{main?.label}</p>
      ) : null}
    </div>
  );
}
