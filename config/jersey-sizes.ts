export const JERSEY_SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
] as const;

export function orderJerseySizes(sizes: readonly string[]): string[] {
  const norm = sizes.map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const primary: string[] = [];
  for (const s of JERSEY_SIZE_OPTIONS) {
    if (norm.includes(s) && !seen.has(s)) {
      seen.add(s);
      primary.push(s);
    }
  }
  const extras = [...new Set(norm.filter((s) => !seen.has(s)))].sort((a, b) =>
    a.localeCompare(b)
  );
  return [...primary, ...extras];
}
