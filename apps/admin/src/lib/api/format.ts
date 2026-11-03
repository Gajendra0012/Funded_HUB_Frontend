/**
 * Showing money and times (ADM-09).
 *
 * Money stays text: the contract sends decimals as strings ("10000.5"), and the browser never turns
 * them into JS numbers, so nothing is rounded or lost. Times are always shown in UTC, built by hand
 * so the server and the browser print exactly the same text.
 */

/** The contract's DecimalString: optional minus, digits, up to 8 decimals, no exponent. */
const DECIMAL = /^(-?)(0|[1-9][0-9]*)(?:\.([0-9]{1,8}))?$/;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "10000.5" → "10,000.50" (minDecimals 2). Never rounds. Anything that isn't a contract decimal is shown as sent. */
export function formatDecimal(value: string, minDecimals = 0): string {
  const match = DECIMAL.exec(value);
  if (!match) return value;
  const [, sign, whole, fraction = ""] = match;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimals = fraction.padEnd(minDecimals, "0");
  return `${sign}${grouped}${decimals ? `.${decimals}` : ""}`;
}

/** ("1234.5", "USD") → "$1,234.50"; ("1234.5", "USDT") → "1,234.50 USDT". */
export function formatMoney(value: string, currency: string): string {
  if (!DECIMAL.test(value)) return value;
  const amount = formatDecimal(value, 2);
  if (currency !== "USD") return `${amount} ${currency}`;
  return amount.startsWith("-") ? `-$${amount.slice(1)}` : `$${amount}`;
}

/** "2026-11-03T08:05:09Z" → "3 Nov 2026, 08:05:09 UTC". Anything that isn't a valid time is shown as sent. */
export function formatUtc(iso: string, options: { seconds?: boolean } = {}): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  const seconds = options.seconds === false ? "" : `:${pad(date.getUTCSeconds())}`;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}${seconds} UTC`;
}
