"use client";

import Image from "next/image";
import Link from "next/link";
import { orderJerseySizes } from "@/config/jersey-sizes";
import type { SectionWithJerseysPublic } from "@/lib/catalog-shared";
import { formatInrFromPaise, primaryJerseyImage } from "@/lib/catalog-shared";

export function SectionCatalog({ sections }: { sections: SectionWithJerseysPublic[] }) {
  if (sections.length === 0) {
    return (
      <section className="px-6 py-16 text-center text-muted-foreground">
        No jerseys yet. Add sections in the admin panel.
      </section>
    );
  }

  return (
    <div className="w-full">
      {sections.map((section) => (
        <section
          key={String(section._id)}
          className="px-6 py-12 border-t border-border first:border-t-0"
        >
          <div className="mx-auto max-w-7xl">
            {section.coverImage ? (
              <div className="relative mb-8 h-40 w-full overflow-hidden border border-border bg-muted/30 md:h-52">
                <Image
                  src={section.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  loading="eager"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-foreground md:text-3xl">
                  {section.name}
                </h2>
              </div>
            ) : (
              <h2 className="mb-8 text-xl font-bold text-foreground">{section.name}</h2>
            )}
            {section.jerseys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jerseys in this section.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.jerseys.map((jersey) => (
                  <Link
                    key={String(jersey._id)}
                    href={`/product/${String(jersey._id)}`}
                    className="group flex flex-col"
                  >
                    <div className="relative mb-3 flex aspect-[4/5] items-center justify-center overflow-hidden bg-muted/50">
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                    <div className="flex items-end justify-between gap-2">
                      <span className="text-sm font-medium text-foreground line-clamp-2">
                        {jersey.name}
                      </span>
                      <span className="shrink-0 text-sm font-medium text-primary">
                        ₹{formatInrFromPaise(jersey.pricePaise)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
