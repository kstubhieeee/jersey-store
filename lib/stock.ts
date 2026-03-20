export function stockCap(piecesInStock: unknown): number | null {
  if (piecesInStock === undefined || piecesInStock === null) return null;
  const n = Math.floor(Number(piecesInStock));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

export function isStockTracked(piecesInStock: unknown): boolean {
  return stockCap(piecesInStock) !== null;
}
