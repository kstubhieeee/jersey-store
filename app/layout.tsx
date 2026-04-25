import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Playfair_Display, Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const metadata: Metadata = {
  title: "ClassicKit",
  description: "Vintage football jerseys",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          "h-full",
          "antialiased",
          quicksand.variable,
          playfairDisplay.variable,
          "font-sans"
        )}
      >
        <body className="min-h-full flex flex-col">
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
