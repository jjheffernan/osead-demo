/**
 * Navigation configuration — Centralized navigation structure
 * Defines main navigation links and footer sections
 * Used by Header and Footer components for consistent navigation
 */

export interface NavItem {
  /** Navigation link URL */
  href: string;
  /** Translation key for localized label */
  labelKey: string;
  /** Optional icon name for icon-only navigation items */
  icon?: string;
  /** Whether this is an external link (opens in new tab) */
  external?: boolean;
  /** Sub-navigation items for dropdown menus */
  children?: NavItem[];
}

/** Main navigation items for header */
export const mainNav: NavItem[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/rentals", labelKey: "nav.rentals" },
  { href: "/sales", labelKey: "nav.sales" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/blog", labelKey: "nav.journal" },
  { href: "/contact", labelKey: "nav.contact" },
] as const;

/** Footer navigation — no location-specific market buttons; collections OK as secondary */
export const footerNav = {
  /** Inventory and editorial destinations */
  product: [
    { href: "/rentals", labelKey: "nav.rentals" },
    { href: "/sales", labelKey: "nav.sales" },
    { href: "/collections", labelKey: "nav.collections" },
    { href: "/blog", labelKey: "nav.journal" },
  ] as const,
  /** Company (legal stays in the meta bar only) */
  company: [
    { href: "/about", labelKey: "nav.about" },
    { href: "/contact", labelKey: "nav.contact" },
  ] as const,
  /** Legal pages — rendered once in the footer meta bar */
  legal: [
    { href: "/privacy", labelKey: "footer.privacy" },
    { href: "/terms", labelKey: "footer.terms" },
  ] as const,
  /** Social media and contact links */
  social: [
    {
      href: "https://github.com/jjheffernan/osead-demo",
      labelKey: "footer.github",
    },
  ] as const,
} as const;

/** Helper function to get navigation items by section */
export function getFooterNav(section: keyof typeof footerNav): NavItem[] {
  return footerNav[section] as unknown as NavItem[];
}
