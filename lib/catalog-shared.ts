export type JerseyImagePublic = {
  label: string;
  url: string;
};

export type JerseyPublic = {
  _id: string;
  sectionId: string;
  name: string;
  description: string;
  pricePaise: number;
  currency: string;
  images: JerseyImagePublic[];
  sizes: string[];
  years: string;
  featured: boolean;
  piecesInStock: number | null;
};

export type SectionWithJerseysPublic = {
  _id: string;
  name: string;
  slug: string;
  sortOrder: number;
  coverImage: string;
  jerseys: JerseyPublic[];
};

export function formatInrFromPaise(paise: number) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function primaryJerseyImage(j: Pick<JerseyPublic, "images">): string {
  return j.images[0]?.url ?? "";
}

export type LeanJersey = {
  _id: { toString(): string };
  sectionId: { toString(): string };
  name: string;
  description?: string;
  pricePaise: number;
  currency?: string;
  image?: string;
  images?: { label?: string; url?: string }[];
  sizes: string[];
  years?: string;
  featured?: boolean;
  piecesInStock?: number | null;
};

export type LeanSection = {
  _id: { toString(): string };
  name: string;
  slug: string;
  sortOrder: number;
  coverImage?: string;
  images?: { label?: string; url?: string }[];
};

export function sectionCoverUrl(s: LeanSection): string {
  if (Array.isArray(s.images)) {
    for (const x of s.images) {
      const u = String(x?.url ?? "").trim();
      if (u) return u;
    }
  }
  return String(s.coverImage ?? "").trim();
}

function collectJerseyImages(j: LeanJersey): JerseyImagePublic[] {
  const raw = Array.isArray(j.images) ? j.images : [];
  const fromArr: JerseyImagePublic[] = [];
  for (const x of raw) {
    const url = String(x?.url ?? "").trim();
    if (!url) continue;
    const label = String(x?.label ?? "").trim() || "Photo";
    fromArr.push({ label, url });
  }
  if (fromArr.length > 0) return fromArr;
  const leg = String(j.image ?? "").trim();
  if (leg) return [{ label: "Front", url: leg }];
  return [];
}

export function toJerseyPublic(j: LeanJersey): JerseyPublic {
  let piecesInStock: number | null = null;
  if (j.piecesInStock !== undefined && j.piecesInStock !== null) {
    const n = Math.floor(Number(j.piecesInStock));
    piecesInStock = Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return {
    _id: j._id.toString(),
    sectionId: j.sectionId.toString(),
    name: j.name,
    description: j.description ?? "",
    pricePaise: j.pricePaise,
    currency: j.currency ?? "INR",
    images: collectJerseyImages(j),
    sizes: j.sizes,
    years: j.years ?? "",
    featured: !!j.featured,
    piecesInStock,
  };
}

export function toSectionWithJerseysPublic(
  s: LeanSection,
  jerseys: LeanJersey[]
): SectionWithJerseysPublic {
  return {
    _id: s._id.toString(),
    name: s.name,
    slug: s.slug,
    sortOrder: s.sortOrder,
    coverImage: sectionCoverUrl(s),
    jerseys: jerseys.map(toJerseyPublic),
  };
}
