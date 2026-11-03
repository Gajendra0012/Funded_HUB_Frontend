/** Pages that show another menu item's page under a second address. */
export const NAV_ALIASES: Readonly<Record<string, string>> = {
  "/users": "/admin-users",
  "/audit": "/audit-log",
  "/kyc-queue": "/kyc",
};

/**
 * Which menu item the sidebar marks for a page (ADM-03): the item itself, the item an alias points to,
 * or, for a detail page such as /traders/123, the item it belongs to (the longest one it starts with).
 */
export function activeNavHref(pathname: string, hrefs: readonly string[]): string | null {
  const path = NAV_ALIASES[pathname] ?? pathname;
  if (hrefs.includes(path)) return path;
  const parents = hrefs.filter((href) => href !== "/" && path.startsWith(`${href}/`));
  return parents.sort((a, b) => b.length - a.length)[0] ?? null;
}

/** A menu item's `aria-current`: "page" for the page itself (or its alias), "location" for the list a detail page belongs to. */
export function navCurrent(pathname: string, href: string, hrefs: readonly string[]): "page" | "location" | undefined {
  if (activeNavHref(pathname, hrefs) !== href) return undefined;
  return (NAV_ALIASES[pathname] ?? pathname) === href ? "page" : "location";
}
