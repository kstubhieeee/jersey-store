"use client";

import Image from "next/image";
import Link from "next/link";
import { orderJerseySizes } from "@/config/jersey-sizes";
import { landingStyle } from "@/config/landing-style";
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
            <h2 className="mb-8 text-xl font-semibold text-foreground">{section.name}</h2>
            {section.jerseys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jerseys in this section.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {section.jerseys.map((jersey) => {
                  const pid = String(jersey._id);
                  const compareAt = jersey.pricePaise + landingStyle.compareAtDeltaPaise;
                  return (
                    <div key={pid} className="group flex flex-col">
                      <Link href={`/product/${pid}`} className="block">
                        <div className="relative mb-3 flex aspect-[4/5] items-center justify-center overflow-hidden bg-muted/50">
                          <div className={landingStyle.saleBadgeClass}>
                            {landingStyle.saleBadge}
                          </div>
                          <div className="relative h-full w-full">
                            {primaryJerseyImage(jersey) ? (
                              <Image
                                src={primaryJerseyImage(jersey)}
                                alt={jersey.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
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
                        <p className="line-clamp-2 text-center text-xs font-medium text-foreground sm:text-sm">
                          {jersey.name}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
                          <span className="font-semibold text-foreground line-through opacity-75">
                            Rs. {formatInrFromPaise(compareAt)}
                          </span>
                          <span className="font-semibold text-red-500">
                            Rs. {formatInrFromPaise(jersey.pricePaise)}
                          </span>
                        </div>
                        <p className="mt-1 text-center text-[10px] text-muted-foreground">
                          {orderJerseySizes(jersey.sizes).join(", ")}
                        </p>
                        <div className="mt-1 h-px w-full bg-transparent">
                          <span className="sr-only">
                            {jersey.name}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
