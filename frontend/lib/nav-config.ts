import type { NavKey } from "@/lib/site-types";

export type { NavKey };

export const headerNav: Record<NavKey, { href: string }> = {
  about: { href: "#aboutCompany" },
  capabilities: { href: "#capabilities" },
  engineering: { href: "#engineering" },
  contact: { href: "#contact" },
};
