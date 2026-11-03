/**
 * Pages that show live backend data. The rest still show sample data, so the top bar labels each page
 * honestly ("Live data" or "Sample data"). Each build order adds the pages it connects.
 */
export const LIVE_PATHS: readonly string[] = [
  "/roles", // AO-4 · ADM-05
  "/admin-users", // AO-4 · ADM-34
  "/users", // alias of /admin-users
];

export function isLivePath(pathname: string): boolean {
  return LIVE_PATHS.includes(pathname);
}
