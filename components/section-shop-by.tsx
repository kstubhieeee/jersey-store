"use client";

import Image from "next/image";
import Link from "next/link";

export function SectionShopBy({
  sections,
}: {
  sections: { slug: string; name: string; coverImage?: string }[];
}) {
  if (sections.length === 0) return null;

  return (
    <section className="w-full border-b border-border bg-background px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-xl font-bold text-foreground">Shop By</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sections.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="group flex flex-col rounded-none border border-border bg-muted/30 overflow-hidden transition-colors hover:border-foreground/50"
            >
              <div className="relative aspect-square w-full bg-muted/50">
                {cat.coverImage ? (
                  <Image
                    src={cat.coverImage}
                    alt=""
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="(max-width: 640px) 50vw, 20vw"
                    loading="eager"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {cat.name}
                  </div>
                )}
              </div>
              <span className="p-3 text-center text-sm font-medium text-foreground">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
