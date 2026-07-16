import type { Locale } from "../../lib/site-config";
import { localePrefix, stripLocale } from "../../i18n/routes";

/**
 * Equivalent localized path for the language switcher.
 * Example: getEquivalentPath("/id/rentals", "en") → "/en/rentals"
 */
export function getEquivalentPath(
  currentPath: string,
  targetLocale: Locale,
): string {
  const contentPath = stripLocale(currentPath);
  const prefix = localePrefix(targetLocale);
  return `${prefix}${contentPath === "/" ? "" : contentPath}`;
}
