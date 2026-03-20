export const SHIPROCKET = {
  basePath: "/v1/external",
  defaultHost: "https://apiv2.shiprocket.in",
  loginPath: "/auth/login",
  adhocPath: "/orders/create/adhoc",
  trackShipmentPath: (shipmentId: string) =>
    `/courier/track/shipment/${encodeURIComponent(shipmentId)}`,
} as const;

export function shiprocketHost() {
  return process.env.SHIPROCKET_API_HOST?.trim() || SHIPROCKET.defaultHost;
}

export function shiprocketPickupLocation() {
  return process.env.SHIPROCKET_PICKUP_LOCATION?.trim() || "";
}

export function shiprocketParcelDims() {
  return {
    length: Number(process.env.SHIPROCKET_PARCEL_LENGTH_CM ?? 28) || 28,
    breadth: Number(process.env.SHIPROCKET_PARCEL_BREADTH_CM ?? 22) || 22,
    height: Number(process.env.SHIPROCKET_PARCEL_HEIGHT_CM ?? 4) || 4,
    weightKg: Number(process.env.SHIPROCKET_PARCEL_WEIGHT_KG ?? 0.45) || 0.45,
  };
}
