export type ClerkOrderProfile = {
  customerName: string;
  customerEmail: string;
  storeUsername: string;
};

type ClerkUserLike = {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: { emailAddress?: string | null }[] | null;
} | null;

export function clerkOrderProfile(u: ClerkUserLike): ClerkOrderProfile {
  const email =
    u?.primaryEmailAddress?.emailAddress?.trim() ||
    u?.emailAddresses?.[0]?.emailAddress?.trim() ||
    "";
  const username = u?.username?.trim() || "";
  const name =
    u?.fullName?.trim() ||
    [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
    username ||
    (email ? email.split("@")[0] : "") ||
    "";
  return {
    customerName: name,
    customerEmail: email,
    storeUsername: username,
  };
}
