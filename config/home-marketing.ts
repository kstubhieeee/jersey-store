export type HomeBanner = {
  id: string;
  src: string;
  alt: string;
  headline: string;
  subline: string;
  href?: string;
};

export const homeBanners: readonly HomeBanner[] = [
  {
    id: "b1",
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80",
    alt: "Football pitch under stadium lights",
    headline: "Match-day classics",
    subline: "Authentic retro kits for every fan",
    href: "/",
  },
  {
    id: "b2",
    src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1800&q=80",
    alt: "Soccer ball on grass",
    headline: "New arrivals weekly",
    subline: "Limited runs — when they are gone, they are gone",
  },
  {
    id: "b3",
    src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1800&q=80",
    alt: "Crowd in a stadium",
    headline: "Free shipping over ₹999",
    subline: "Easy returns within 7 days",
    href: "/cart",
  },
];

export type HomeTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

export const homeTestimonials: readonly HomeTestimonial[] = [
  {
    id: "t1",
    quote:
      "Quality is insane for the price. My 1998 away kit arrived in three days and looks brand new.",
    author: "Rahul M.",
    role: "Mumbai",
  },
  {
    id: "t2",
    quote:
      "Finally a store that actually has sizes that fit. Checkout was smooth and tracking worked perfectly.",
    author: "Ananya K.",
    role: "Bengaluru",
  },
  {
    id: "t3",
    quote:
      "Bought two jerseys as gifts — both were hits. Packaging was neat and the fabric feels premium.",
    author: "Vikram S.",
    role: "Delhi",
  },
];

export const siteFooter = {
  brandName: "Demonoid",
  blurb: "Vintage football jerseys, curated for collectors and everyday fans.",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Home", href: "/" },
        { label: "Cart", href: "/cart" },
        { label: "Checkout", href: "/checkout" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Orders", href: "/orders" },
        { label: "Sign in", href: "/sign-in" },
      ],
    },
  ],
  bottomLinks: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "mailto:hello@demonoid.example" },
  ],
  copyrightYear: 2026,
} as const;
