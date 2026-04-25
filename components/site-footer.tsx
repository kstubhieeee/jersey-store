import Link from "next/link";
import { siteFooter } from "@/config/home-marketing";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-lg font-bold text-foreground">{siteFooter.brandName}</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{siteFooter.blurb}</p>
          </div>
          {siteFooter.columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {siteFooter.copyrightYear} {siteFooter.brandName}. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-4">
            {siteFooter.bottomLinks.map((l) => (
              <Link
                key={l.label + l.href}
                href={l.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
