import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
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
        className={cn("h-full", "antialiased", "dark", workSans.variable, "font-sans")}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
