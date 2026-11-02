/** Number formatting used across the landing page. Always US style: $1,234.56 */

/** $1,234.56 (or $1,235 with decimals = 0). */
export function formatUsd(value: number, decimals: 0 | 2 = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** +$182.00 / −$40.00, for profit and loss. */
export function formatSignedUsd(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return sign + formatUsd(Math.abs(value));
}

/** 100000 → "$100K". */
export function formatSize(value: number): string {
  return `$${value / 1000}K`;
}

/** 0.0123 → "+1.23%". */
export function formatChange(fraction: number): string {
  const pct = (fraction * 100).toFixed(2);
  return fraction >= 0 ? `+${pct}%` : `${pct}%`;
}

/** 108420.5 with 1 decimal → "108,420.5". */
export function formatPrice(value: number, decimals: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
