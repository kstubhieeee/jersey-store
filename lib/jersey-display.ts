export function primaryJerseyUrlFromDoc(j: {
  images?: { url?: string }[];
  image?: string;
}): string {
  if (Array.isArray(j.images)) {
    for (const x of j.images) {
      const u = String(x?.url ?? "").trim();
      if (u) return u;
    }
  }
  return String(j.image ?? "").trim();
}
