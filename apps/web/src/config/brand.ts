/**
 * Brand configuration — the single place to rebrand the demo.
 * Change the name, copy, colours, headline stats and promo here.
 * Plan prices and rules live in `src/data/plans.ts`.
 */

export type PaletteId = "neon" | "electric" | "gold";

export type Palette = {
  id: PaletteId;
  name: string;
  vibe: string;
  /** accent-1, accent-2, accent-3 */
  accents: [string, string, string];
};

export const palettes: Record<PaletteId, Palette> = {
  neon: {
    id: "neon",
    name: "Neon Terminal",
    vibe: "Futuristic, energetic",
    accents: ["#00E5A0", "#00B3FF", "#7C5CFF"],
  },
  electric: {
    id: "electric",
    name: "Electric Blue",
    vibe: "Institutional, trustworthy",
    accents: ["#3D7BFF", "#22D3EE", "#A855F7"],
  },
  gold: {
    id: "gold",
    name: "Gold Luxe",
    vibe: "Premium, exclusive",
    accents: ["#F2C14E", "#FF8A3D", "#FFE7A3"],
  },
};

export const paletteOrder: PaletteId[] = ["neon", "electric", "gold"];

export const brand = {
  name: "Funded HUB",
  shortName: "Funded",
  tagline: "Trade our capital. Keep up to 90% of the profits.",
  description:
    "Funded HUB funds skilled traders with up to $200,000 in simulated capital. Pass the evaluation, get funded, and keep up to 90% of the rewards.",
  currency: "USD",
  /** Placeholder until the real support address is chosen (.example is a reserved, never-real domain). */
  supportEmail: "support@fundedhub.example",
  server: "FundedHUB-Demo",
  maxCapital: 200_000,
  maxRewardShare: 90,
  defaultPalette: "neon" as PaletteId,
  storageKeys: {
    palette: "fundedhub-palette",
    store: "fundedhub-demo-v1",
    booted: "fundedhub-booted",
    wallet: "fundedhub-wallet",
  },
  /** Headline numbers used on the marketing site. */
  stats: {
    rewardsPaidMillions: 48.2,
    fundedTraders: 27_400,
    countries: 150,
    avgPayoutHours: 7,
    avgPayoutMinutes: 42,
    trustpilot: 4.8,
    reviews: 12_480,
    paidLast24h: 312_480,
  },
  /** One quiet, site-wide promo. Set `active: false` to hide strike-through prices. */
  promo: {
    active: true,
    label: "Autumn launch",
    pct: 20,
    models: ["two-step", "one-step"] as string[],
  },
  coupon: { code: "DEMO50", pct: 50 },
  /** Social accounts are not set up yet; the buttons only show these placeholders. */
  social: [
    { label: "X", handle: "Account coming soon" },
    { label: "Discord", handle: "Server coming soon" },
    { label: "Telegram", handle: "Channel coming soon" },
    { label: "YouTube", handle: "Channel coming soon" },
  ],
  hq: { city: "Dubai", location: [25.2048, 55.2708] as [number, number] },
  legalEntity: "Funded HUB (preview build)",
  /** Shown by the older design-system page header and footer. */
  previewNotice: "Design preview. Program figures and performance examples are illustrative, not a live offer.",
} as const;

/** CSS generated from the palettes above, injected in the root layout. */
export function buildPaletteCss(): string {
  const rule = (selector: string, id: PaletteId) => {
    const [a1, a2, a3] = palettes[id].accents;
    return `${selector}{--accent-1:${a1};--accent-2:${a2};--accent-3:${a3};}`;
  };
  // Default first, so the attribute selectors (same specificity) always win.
  return (
    rule(":root", brand.defaultPalette) +
    paletteOrder.map((id) => rule(`[data-palette="${id}"]`, id)).join("")
  );
}

/** Runs before first paint: applies the saved palette without a flash. */
export function buildPaletteScript(): string {
  const ids = JSON.stringify(paletteOrder);
  return `(function(){try{var p=localStorage.getItem(${JSON.stringify(
    brand.storageKeys.palette,
  )});if(p&&${ids}.indexOf(p)>-1){document.documentElement.setAttribute("data-palette",p)}}catch(e){}})();`;
}
