import mongoose from "mongoose";

const sectionImageSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Cover" },
    url: { type: String, required: true },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sortOrder: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    images: { type: [sectionImageSchema], default: [] },
  },
  { timestamps: true }
);

const jerseyImageSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Front" },
    url: { type: String, required: true },
  },
  { _id: false }
);

const jerseySchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    pricePaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    image: { type: String, default: "" },
    images: { type: [jerseyImageSchema], default: [] },
    sizes: [{ type: String }],
    years: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    piecesInStock: { type: Number },
  },
  { timestamps: true }
);

const cartItemSchema = new mongoose.Schema(
  {
    jerseyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jersey",
      required: true,
    },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    jerseyId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePaise: { type: Number, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerName: { type: String, default: "" },
    storeUsername: { type: String, default: "" },
    shippingAddress: { type: shippingAddressSchema, default: undefined },
    items: [orderItemSchema],
    totalPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    fulfillmentNote: { type: String, default: "" },
    shiprocketNote: { type: String, default: "" },
    shiprocketOrderId: { type: String, default: "" },
    shiprocketShipmentId: { type: String, default: "" },
    deliveryStatus: { type: String, default: "" },
    awbCode: { type: String, default: "" },
    courierName: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    alt: { type: String, default: "" },
    headline: { type: String, default: "" },
    subline: { type: String, default: "" },
    href: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Section =
  mongoose.models.Section || mongoose.model("Section", sectionSchema);
export const Jersey =
  mongoose.models.Jersey || mongoose.model("Jersey", jerseySchema);
export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
export const Banner =
  mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
