"use client";

import Image from "next/image";
import Link from "next/link";
import { landingStyle } from "@/config/landing-style";
import type { JerseyPublic } from "@/lib/catalog-shared";
import { formatInrFromPaise, primaryJerseyImage } from "@/lib/catalog-shared";

export function SectionNewArrivals({
  jerseys,
  viewAllHref,
}: {
  jerseys: JerseyPublic[];
  viewAllHref: string;
}) {
  if (jerseys.length === 0) return null;

  return (
    <section className="w-full border-b border-border bg-background px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#232323]" />
            <h2 className="text-sm font-semibold tracking-[0.2em] text-foreground">
              {landingStyle.sectionTitle}
            </h2>
            <div className="h-px w-12 bg-[#232323]" />
          </div>
          <div className="mt-3 text-center">
            <Link
              href={viewAllHref}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {landingStyle.viewAllLabel}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {jerseys.map((jersey) => {
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
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
