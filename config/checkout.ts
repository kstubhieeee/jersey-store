export const PENDING_CHECKOUT_MAX_AGE_MS =
  Number(process.env.PENDING_CHECKOUT_MAX_AGE_MS) > 0
    ? Number(process.env.PENDING_CHECKOUT_MAX_AGE_MS)
    : 25 * 60 * 1000;
