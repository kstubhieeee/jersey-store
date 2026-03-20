export function placeholderShippingAllowed() {
  return process.env.SHIPROCKET_ALLOW_PLACEHOLDER_SHIPPING === "1";
}

export function placeholderShippingFromEnv() {
  return {
    phone: process.env.SHIPROCKET_PLACEHOLDER_PHONE?.trim() || "9999999999",
    line1: process.env.SHIPROCKET_PLACEHOLDER_LINE1?.trim() || "Test address line 1",
    line2: process.env.SHIPROCKET_PLACEHOLDER_LINE2?.trim() || "",
    city: process.env.SHIPROCKET_PLACEHOLDER_CITY?.trim() || "Mumbai",
    state: process.env.SHIPROCKET_PLACEHOLDER_STATE?.trim() || "Maharashtra",
    pincode: process.env.SHIPROCKET_PLACEHOLDER_PINCODE?.trim() || "400001",
    country: process.env.SHIPROCKET_PLACEHOLDER_COUNTRY?.trim() || "India",
  };
}
