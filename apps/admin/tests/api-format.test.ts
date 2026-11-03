import { describe, expect, it } from "vitest";
import { formatDecimal, formatMoney, formatUtc } from "../src/lib/api/format";

describe("money stays text (ADM-09)", () => {
  it("adds thousands separators without turning the value into a number", () => {
    expect(formatDecimal("10000.5")).toBe("10,000.5");
    expect(formatDecimal("10000.5", 2)).toBe("10,000.50");
    expect(formatDecimal("1234567.12345678", 2)).toBe("1,234,567.12345678");
    expect(formatDecimal("999")).toBe("999");
    expect(formatDecimal("0", 2)).toBe("0.00");
    expect(formatDecimal("-5.5", 2)).toBe("-5.50");
  });

  it("never rounds, even beyond what a JS number can hold", () => {
    expect(formatDecimal("90071992547409931.00000001")).toBe("90,071,992,547,409,931.00000001");
  });

  it("shows anything that isn't a contract decimal exactly as sent", () => {
    for (const odd of ["1e5", "01.5", "1,000", "", "abc", "1.123456789"]) expect(formatDecimal(odd)).toBe(odd);
    expect(formatMoney("1e5", "USD")).toBe("1e5");
  });

  it("writes USD with $ and other currencies after the amount", () => {
    expect(formatMoney("1234.5", "USD")).toBe("$1,234.50");
    expect(formatMoney("-20", "USD")).toBe("-$20.00");
    expect(formatMoney("1234.5", "USDT")).toBe("1,234.50 USDT");
  });
});

describe("times are UTC (ADM-09)", () => {
  it("prints contract timestamps in UTC", () => {
    expect(formatUtc("2026-11-03T08:05:09Z")).toBe("3 Nov 2026, 08:05:09 UTC");
    expect(formatUtc("2026-11-03T08:05:09.123Z", { seconds: false })).toBe("3 Nov 2026, 08:05 UTC");
    expect(formatUtc("2026-12-31T23:59:59+05:30")).toBe("31 Dec 2026, 18:29:59 UTC");
  });

  it("shows anything that isn't a time exactly as sent", () => {
    expect(formatUtc("not a time")).toBe("not a time");
  });
});
