// Reference demo figures for design review; replace with approved API configuration before launch.
export const accountSizes = [5000, 10000, 25000, 50000, 100000, 200000] as const;
export type AccountSize = (typeof accountSizes)[number];
export const challengeModels = [
  { id: "two-step", name: "2-Step", title: "2-Step Evaluation", description: "Two phases. One clear path to proving your consistency.", targets: [8, 5], dailyLoss: 5, maxLoss: 10, lossType: "Static", minDays: 4, share: 80, frequency: "Monthly", prices: [49, 89, 179, 299, 499, 949] },
  { id: "one-step", name: "1-Step", title: "1-Step Evaluation", description: "One evaluation phase for traders ready to prove their edge.", targets: [10], dailyLoss: 3, maxLoss: 6, lossType: "Trailing", minDays: 3, share: 80, frequency: "Monthly", prices: [59, 105, 209, 349, 579, 1099] },
  { id: "instant", name: "Instant", title: "Instant Funding", description: "A direct route to the simulated funded stage, with tighter risk limits.", targets: [], dailyLoss: 3, maxLoss: 5, lossType: "Trailing", minDays: 0, share: 70, frequency: "Every 14 days", prices: [129, 229, 449, 749, 1249, 2399] },
] as const;
export type ChallengeModel = (typeof challengeModels)[number];

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function getChallengePreview(model: ChallengeModel, size: AccountSize, dollars: boolean) {
  const value = (percent: number) => dollars ? formatMoney(size * percent / 100) : `${percent}%`;
  return {
    price: model.prices[accountSizes.indexOf(size)],
    target: model.targets.length ? model.targets.map(value).join(" → ") : "No evaluation",
    dailyLoss: value(model.dailyLoss),
    maxLoss: value(model.maxLoss),
  };
}

export const landingFaq = [
  { q: "How does a challenge work?", a: "Choose a program and simulated account size. For an evaluation program, reach each phase’s profit target while respecting its loss limits and trading rules. After passing the required reviews, KYC and trader agreement, you can progress to a simulated funded account. Instant programs skip the evaluation phases." },
  { q: "Am I trading real money?", a: "No. Both evaluation and funded accounts use virtual funds in Bybit Demo Trading. Eligible performance rewards are real payments from the firm, subject to the approved program terms and review. Simulated trading does not guarantee future results." },
  { q: "Where do I place my trades?", a: "Trading takes place on a dedicated Demo Trading sub-account of your own Bybit account. This platform is designed to show your challenge progress and risk objectives. It does not place trades on your behalf. Supported pairs and country eligibility depend on the approved program and Bybit availability." },
  { q: "What happens if I reach a loss limit?", a: "A hard breach can fail a challenge; a soft breach may result in a warning or penalty, depending on the program. Daily loss and maximum drawdown are different limits. Open-position profit and loss, fees and funding can affect your equity, so check the full rules before trading." },
  { q: "How do reward requests work?", a: "Eligible funded traders can submit a reward request once program conditions are met. Requests are reviewed before payment. USDT, USDC and BTC are the planned reward currencies. The final split, payout cycle, minimums and supported networks will be set in the approved policy." },
  { q: "Is the challenge fee refundable?", a: "The reference 2-Step and 1-Step programs show a fee refund with the first eligible reward; Instant fees are shown as non-refundable. The selector on this page is an illustrative design preview. Only the final published purchase terms will govern a real order." },
  { q: "Can I join from any country?", a: "Availability depends on the firm’s eligibility policy and Bybit’s regional restrictions. A country’s appearance in sample content does not confirm eligibility. The registration flow will check country eligibility before allowing an account to be created." },
];
