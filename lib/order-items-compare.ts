export type OrderLineComparable = {
  jerseyId: string;
  size: string;
  quantity: number;
  pricePaise: number;
};

export function orderItemsFingerprint(items: OrderLineComparable[]): string {
  return [...items]
    .map((x) => ({
      jerseyId: String(x.jerseyId),
      size: String(x.size),
      quantity: Number(x.quantity),
      pricePaise: Number(x.pricePaise),
    }))
    .sort((a, b) =>
      `${a.jerseyId}\0${a.size}`.localeCompare(`${b.jerseyId}\0${b.size}`)
    )
    .map((x) => `${x.jerseyId}|${x.size}|${x.quantity}|${x.pricePaise}`)
    .join(";");
}

export function orderItemsMatch(a: OrderLineComparable[], b: OrderLineComparable[]): boolean {
  return orderItemsFingerprint(a) === orderItemsFingerprint(b);
}
