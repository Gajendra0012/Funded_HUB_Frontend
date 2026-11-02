/**
 * Landing page content.
 *
 * Every text, number and list shown on the landing page lives in this file.
 * The components in `src/components/landing` only decide how it looks.
 * To change what the page says, edit this file.
 *
 * IMPORTANT — before launch:
 * Anything marked "SAMPLE" is illustrative content for the design preview
 * (trader names, payout amounts, leaderboard). Replace it with real, approved
 * data before the page goes live.
 *
 * Prices are not here: they come from src/data/plans.ts, which the challenges
 * page and checkout also use. The brand name comes from src/config/brand.ts.
 */

// ─────────────────────────────── Company ───────────────────────────────

export const headquarters = { city: "Dubai", country: "UAE", location: [25.2048, 55.2708] as [number, number] };

// ─────────────────────────────── Hero ───────────────────────────────

export const hero = {
  badge: { tag: "New", text: "Crypto challenges on Bybit Demo" },
  /** The words that cycle after "Your edge in …". */
  keywords: ["Bitcoin", "Ethereum", "Solana", "BNB"],
  text: "Trade crypto on your own Bybit Demo account with simulated capital. Pass the challenge, get funded, and earn up to 80% of the profits as real rewards.",
  trustPoints: ["Simulated capital, real rewards", "Paid in USDT, USDC or BTC", "Daily reset at 00:00 UTC"],
} as const;

/** The sample trading account shown in the hero card. Matches the 2-Step $100K rules below. */
export const heroAccount = {
  title: "Phase 1 · $100K 2-Step",
  platform: "Bybit Demo",
  /** Shown after the platform on wider screens only. */
  accountId: "UID ••8301",
  start: 100_000,
  target: 108_000,
  equity: 105_272.4,
  dayStart: 105_020,
  dailyLossLimit: 5_000,
  maxLossFloor: 90_000,
  tradingDays: { done: 3, required: 4 },
  rewardChip: { label: "Reward approved · USDT", amount: 5_778 },
  riskChip: { label: "Risk engine", value: "6 / 6 rules passing" },
} as const;

// ─────────────────────────────── Key facts ───────────────────────────────

/** The four numbers under the hero. These describe the product, not past results. */
export const keyFacts = [
  { label: "Account sizes", value: "$5K–$200K", sub: "Simulated capital per challenge" },
  { label: "Programs", value: "3", sub: "2-Step, 1-Step and Instant" },
  { label: "Profit share", value: "Up to 80%", sub: "Paid in USDT, USDC or BTC" },
  { label: "Markets", value: "24/7", sub: "Crypto perpetuals on Bybit Demo" },
] as const;

// ─────────────────────────────── How it works ───────────────────────────────

export type StepIcon = "choose" | "connect" | "target" | "payout";

export const steps: { icon: StepIcon; title: string; text: string; chip: string }[] = [
  {
    icon: "choose",
    title: "Choose your challenge",
    text: "Pick 2-Step, 1-Step or Instant and an account size from $5K to $200K. One-time fee, no subscription.",
    chip: "3 programs · 6 sizes",
  },
  {
    icon: "connect",
    title: "Connect Bybit Demo",
    text: "Create a Demo Trading sub-account in your own Bybit account and connect it with an API key. We set the balance; you trade.",
    chip: "Your account, our rules",
  },
  {
    icon: "target",
    title: "Pass the evaluation",
    text: "Hit the profit target while staying inside the daily and maximum loss limits. The risk engine checks every trade in real time.",
    chip: "8% → 5% targets",
  },
  {
    icon: "payout",
    title: "Get funded and paid",
    text: "Complete KYC, move to the funded stage and request rewards in USDT, USDC or BTC. Every request is reviewed, then paid.",
    chip: "Up to 80% profit share",
  },
];

// ─────────────────────────────── Programs (rules shown on the home page) ───────────────────────────────

export const accountSizes = [5_000, 10_000, 25_000, 50_000, 100_000, 200_000] as const;
export type AccountSize = (typeof accountSizes)[number];

export type ProgramId = "two-step" | "one-step" | "instant";

export type Program = {
  id: ProgramId;
  /** Short name for the tabs. */
  name: string;
  /** Full name for the price card. */
  title: string;
  description: string;
  /** Profit target per phase, in %. Empty for Instant (no evaluation). */
  targets: number[];
  dailyLossPct: number;
  maxLossPct: number;
  maxLossType: "Static" | "Trailing";
  minTradingDays: number;
  profitSharePct: number;
  rewardCycle: string;
  feeRefunded: boolean;
};

export const programs: Program[] = [
  {
    id: "two-step",
    name: "2-Step",
    title: "2-Step Evaluation",
    description: "The classic path. Two phases, the most forgiving loss limits.",
    targets: [8, 5],
    dailyLossPct: 5,
    maxLossPct: 10,
    maxLossType: "Static",
    minTradingDays: 4,
    profitSharePct: 80,
    rewardCycle: "Monthly",
    feeRefunded: true,
  },
  {
    id: "one-step",
    name: "1-Step",
    title: "1-Step Evaluation",
    description: "One evaluation phase for traders ready to prove their edge.",
    targets: [10],
    dailyLossPct: 3,
    maxLossPct: 6,
    maxLossType: "Trailing",
    minTradingDays: 3,
    profitSharePct: 80,
    rewardCycle: "Monthly",
    feeRefunded: true,
  },
  {
    id: "instant",
    name: "Instant",
    title: "Instant Funding",
    description: "Skip the evaluation and start at the funded stage, with tighter limits.",
    targets: [],
    dailyLossPct: 3,
    maxLossPct: 5,
    maxLossType: "Trailing",
    minTradingDays: 0,
    profitSharePct: 70,
    rewardCycle: "Every 14 days",
    feeRefunded: false,
  },
];

/** The combination highlighted as "Most popular". */
export const popularPlan = { program: "two-step" as ProgramId, size: 100_000 as AccountSize };

/** Leverage is the same for every program at launch. */
export const leverage = "1:5 BTC & ETH · 1:2 others";

export const programNote = "Prices and rules are examples for this preview. Final values are set per program before launch.";

// ─────────────────────────────── Global reach ───────────────────────────────

/**
 * Cities drawn on the globe. Only countries outside Bybit's restricted list,
 * because Funded HUB accepts traders wherever Bybit offers its service.
 */
export const globeCities = [
  { city: "Mumbai", country: "IN", location: [19.076, 72.8777] as [number, number] },
  { city: "Lagos", country: "NG", location: [6.5244, 3.3792] as [number, number] },
  { city: "São Paulo", country: "BR", location: [-23.5558, -46.6396] as [number, number] },
  { city: "Istanbul", country: "TR", location: [41.0082, 28.9784] as [number, number] },
  { city: "Manila", country: "PH", location: [14.5995, 120.9842] as [number, number] },
  { city: "Mexico City", country: "MX", location: [19.4326, -99.1332] as [number, number] },
  { city: "Johannesburg", country: "ZA", location: [-26.2041, 28.0473] as [number, number] },
  { city: "Nairobi", country: "KE", location: [-1.2921, 36.8219] as [number, number] },
  { city: "Karachi", country: "PK", location: [24.8607, 67.0011] as [number, number] },
  { city: "Ho Chi Minh City", country: "VN", location: [10.8231, 106.6297] as [number, number] },
  { city: "Jakarta", country: "ID", location: [-6.2088, 106.8456] as [number, number] },
  { city: "Buenos Aires", country: "AR", location: [-34.6037, -58.3816] as [number, number] },
  { city: "Bogotá", country: "CO", location: [4.711, -74.0721] as [number, number] },
  { city: "Kuala Lumpur", country: "MY", location: [3.139, 101.6869] as [number, number] },
  { city: "Bangkok", country: "TH", location: [13.7563, 100.5018] as [number, number] },
  { city: "Cairo", country: "EG", location: [30.0444, 31.2357] as [number, number] },
  { city: "Riyadh", country: "SA", location: [24.7136, 46.6753] as [number, number] },
];

export const reachPoints = ["Headquartered in Dubai", "24/7 crypto markets", "Eligibility checked at sign-up"] as const;

// ─────────────────────────────── Payouts (SAMPLE) ───────────────────────────────

export type PayoutMethod = "USDT" | "USDC" | "BTC";
export const payoutMethods: PayoutMethod[] = ["USDT", "USDC", "BTC"];

/** SAMPLE payout cards. Names are masked, as real ones will be. */
export const samplePayouts: { name: string; size: string; ago: string; amount: number; method: PayoutMethod }[] = [
  { name: "Arjun M.", size: "$100K", ago: "9 min ago", amount: 11_674.95, method: "USDT" },
  { name: "Chiamaka E.", size: "$200K", ago: "18 min ago", amount: 9_522.21, method: "USDT" },
  { name: "Lucas R.", size: "$100K", ago: "34 min ago", amount: 2_202.63, method: "USDC" },
  { name: "Mehmet K.", size: "$50K", ago: "1h ago", amount: 8_759.85, method: "USDT" },
  { name: "Andrea L.", size: "$200K", ago: "2h ago", amount: 7_349.95, method: "BTC" },
  { name: "Nguyen T.", size: "$25K", ago: "3h ago", amount: 1_964.4, method: "USDT" },
  { name: "Sipho D.", size: "$100K", ago: "4h ago", amount: 4_480.1, method: "USDC" },
  { name: "Farah A.", size: "$50K", ago: "5h ago", amount: 3_115.75, method: "USDT" },
  { name: "Diego P.", size: "$100K", ago: "6h ago", amount: 13_113.94, method: "USDT" },
  { name: "Hannah W.", size: "$100K", ago: "9h ago", amount: 7_085.57, method: "BTC" },
  { name: "Omar F.", size: "$100K", ago: "12h ago", amount: 6_746.13, method: "USDT" },
  { name: "Mateo G.", size: "$200K", ago: "16h ago", amount: 7_689.36, method: "USDC" },
  { name: "Aisha N.", size: "$100K", ago: "19h ago", amount: 7_772.2, method: "USDT" },
  { name: "Rizal S.", size: "$50K", ago: "21h ago", amount: 2_683.4, method: "USDT" },
];

/** SAMPLE starting value for the "paid in the last 24h" counter. */
export const samplePaidLast24h = 312_480;

// ─────────────────────────────── Platform ───────────────────────────────

export type PlatformIcon = "prices" | "account" | "pairs" | "leverage";

export const platformFeatures: { icon: PlatformIcon; title: string; text: string }[] = [
  {
    icon: "prices",
    title: "Real market prices",
    text: "Bybit Demo runs on live market data, so every fill reflects the real order book.",
  },
  {
    icon: "account",
    title: "Your own sub-account",
    text: "You trade in a Demo Trading sub-account inside your own Bybit account. No new terminal to learn.",
  },
  {
    icon: "pairs",
    title: "Major perpetuals",
    text: "BTC, ETH, SOL and BNB USDT perpetuals at launch, with more pairs added over time.",
  },
  {
    icon: "leverage",
    title: "Clear leverage caps",
    text: "Up to 1:5 on BTC and ETH and 1:2 on other pairs, shown on every account.",
  },
];

// ─────────────────────────────── Leaderboard (SAMPLE) ───────────────────────────────

export const sampleLeaderboard = [
  { name: "Mateo G.", account: "$200K 2-Step", profitPct: 24.86, gain: 49_720 },
  { name: "Amara O.", account: "$50K 1-Step", profitPct: 23.88, gain: 11_940 },
  { name: "Wei L.", account: "$200K 2-Step", profitPct: 23.36, gain: 46_720 },
  { name: "Olivia B.", account: "$200K 1-Step", profitPct: 23.0, gain: 46_000 },
  { name: "Ravi K.", account: "$200K 2-Step", profitPct: 22.21, gain: 44_420 },
];

// ─────────────────────────────── What traders get ───────────────────────────────

export type PromiseIcon = "rules" | "account" | "prices" | "reset" | "review" | "crypto";

export const traderPromises: { icon: PromiseIcon; title: string; text: string }[] = [
  { icon: "rules", title: "Rules on every screen", text: "Daily loss, maximum loss and profit target are shown live, in dollars and percent." },
  { icon: "account", title: "Your own Bybit account", text: "You trade in a Demo Trading sub-account inside your own Bybit account." },
  { icon: "prices", title: "Real market prices", text: "Bybit Demo uses live prices, so practice feels like the real market." },
  { icon: "reset", title: "Clear daily reset", text: "The trading day resets at 00:00 UTC, the standard for crypto markets." },
  { icon: "review", title: "Reviewed payouts", text: "Every reward request is checked and approved by a person before it is paid." },
  { icon: "crypto", title: "Crypto rewards", text: "Receive your rewards in USDT, USDC or BTC, straight to your wallet." },
];

// ─────────────────────────────── FAQ ───────────────────────────────

export const faq = [
  {
    q: "How does a challenge work?",
    a: "Choose a program and simulated account size. For an evaluation program, reach each phase’s profit target while respecting its loss limits and trading rules. After passing the required reviews, KYC and trader agreement, you can progress to a simulated funded account. Instant programs skip the evaluation phases.",
  },
  {
    q: "Am I trading real money?",
    a: "No. Both evaluation and funded accounts use virtual funds in Bybit Demo Trading. Eligible performance rewards are real payments from the firm, subject to the approved program terms and review. Simulated trading does not guarantee future results.",
  },
  {
    q: "Where do I place my trades?",
    a: "Trading takes place on a dedicated Demo Trading sub-account of your own Bybit account. This platform shows your challenge progress and risk objectives. It does not place trades on your behalf. Supported pairs and country eligibility depend on the approved program and Bybit availability.",
  },
  {
    q: "What happens if I reach a loss limit?",
    a: "A hard breach can fail a challenge; a soft breach may result in a warning or penalty, depending on the program. Daily loss and maximum drawdown are different limits. Open-position profit and loss, fees and funding can affect your equity, so check the full rules before trading.",
  },
  {
    q: "How do reward requests work?",
    a: "Eligible funded traders can submit a reward request once program conditions are met. Requests are reviewed before payment. USDT, USDC and BTC are the planned reward currencies. The final split, payout cycle, minimums and supported networks will be set in the approved policy.",
  },
  {
    q: "Is the challenge fee refundable?",
    a: "The example 2-Step and 1-Step programs refund the fee with the first eligible reward; Instant fees are not refundable. The selector on this page is an illustrative preview. Only the final published purchase terms will govern a real order.",
  },
  {
    q: "Can I join from any country?",
    a: "Availability depends on the firm’s eligibility policy and Bybit’s regional restrictions. The registration flow checks country eligibility before an account can be created.",
  },
];

// ─────────────────────────────── Helpers ───────────────────────────────

/** Finds a program by its id. */
export function getProgram(id: ProgramId): Program {
  return programs.find((p) => p.id === id) ?? programs[0];
}
