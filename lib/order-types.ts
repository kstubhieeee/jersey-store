export type ShippingAddressLean = {
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type OrderItemLean = {
  jerseyId: string;
  name: string;
  image?: string;
  size: string;
  quantity: number;
  pricePaise: number;
};

export type OrderDocLike = {
  _id: { toString(): string };
  createdAt?: Date;
  customerEmail?: string;
  customerName?: string;
  totalPaise: number;
  razorpayOrderId?: string;
  shippingAddress?: ShippingAddressLean | null;
  items: OrderItemLean[];
};
