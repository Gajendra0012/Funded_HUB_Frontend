import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apiError, API_MESSAGES, parseErrorBody } from "../src/lib/api/errors";
import {
  COUNTRY_CODES,
  SETTINGS,
  countryChanges,
  countryName,
  definitionOf,
  draftOf,
  formatValue,
  isChange,
  parseDraft,
  saveErrorMessage,
  searchCountries,
} from "../src/lib/settings";

const contract = JSON.parse(readFileSync(new URL("../contract/openapi.json", import.meta.url), "utf8")) as {
  paths: Record<string, { put?: { parameters?: { name: string; schema: { enum?: string[] } }[] } }>;
};
const value = (result: ReturnType<typeof parseDraft>) => ("value" in result ? result.value : `error: ${result.error}`);

describe("settings: the list (ADM-36)", () => {
  it("has exactly the 7 settings the API supports", () => {
    const keys = contract.paths["/api/v1/admin/settings/{key}"].put?.parameters?.find((p) => p.name === "key")?.schema.enum ?? [];
    expect(keys).toHaveLength(7);
    expect(SETTINGS.map((setting) => setting.key).sort()).toEqual([...keys].sort());
  });

  it("says which settings anything reads today: only sign-up's two (backend dev 1d4c8bf)", () => {
    expect(SETTINGS.filter((setting) => setting.inUse).map((setting) => setting.key).sort()).toEqual(["min_age_years", "restricted_countries"]);
    for (const setting of SETTINGS.filter((s) => !s.inUse)) expect(setting.usedBy, setting.key).toMatch(/^Nothing reads it yet/);
  });
});

describe("settings: countries (ADM-36)", () => {
  it("offers the backend's 249 ISO codes, each with an English name", () => {
    expect(COUNTRY_CODES).toHaveLength(249);
    expect(new Set(COUNTRY_CODES).size).toBe(249);
    expect(COUNTRY_CODES.every((code) => /^[A-Z]{2}$/.test(code))).toBe(true);
    expect(COUNTRY_CODES).not.toContain("XK");
    expect(COUNTRY_CODES.filter((code) => countryName(code) === code)).toEqual([]);
    expect(countryName("AE")).toBe("United Arab Emirates");
  });

  it("finds countries by name or code, sorted by name", () => {
    expect(searchCountries("arab emirates")).toEqual(["AE"]);
    expect(searchCountries("CA")).toContain("CA");
    expect(searchCountries("").length).toBe(249);
    const names = searchCountries("").map(countryName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(searchCountries("zzzz")).toEqual([]);
  });

  it("lists what a change restricts and what it frees, by name", () => {
    expect(countryChanges(["US", "CA"], ["CA", "KP", "CU"])).toEqual({ added: ["CU", "KP"], removed: ["US"] });
  });
});

describe("settings: checking a value before it's sent (ADM-36)", () => {
  it("text: trimmed, 1 to 120 characters", () => {
    const setting = definitionOf("platform_name");
    expect(value(parseDraft(setting, "  Funded HUB "))).toBe("Funded HUB");
    expect(value(parseDraft(setting, "   "))).toBe("error: Enter 1 to 120 characters.");
    expect(value(parseDraft(setting, "x".repeat(121)))).toBe("error: Enter 1 to 120 characters.");
  });

  it("email: a valid address", () => {
    const setting = definitionOf("support_email");
    expect(value(parseDraft(setting, " support@fundedhub.com "))).toBe("support@fundedhub.com");
    for (const bad of ["support", "support@", "a@b", "a b@c.com"]) expect(value(parseDraft(setting, bad)), bad).toBe("error: Enter a valid email address.");
  });

  it("time: HH:mm, 24-hour", () => {
    const setting = definitionOf("daily_reset_utc");
    expect(value(parseDraft(setting, "06:30"))).toBe("06:30");
    for (const bad of ["24:00", "6:30", "06:60", ""]) expect(value(parseDraft(setting, bad)), bad).toBe("error: Enter a time as HH:mm, 24-hour, in UTC.");
  });

  it("numbers: whole numbers in each setting's range, sent as numbers", () => {
    expect(value(parseDraft(definitionOf("min_age_years"), "21"))).toBe(21);
    for (const bad of ["17", "101", "18.5", "-1", "1e2", ""]) {
      expect(value(parseDraft(definitionOf("min_age_years"), bad)), bad).toBe("error: Enter a whole number from 18 to 100.");
    }
    expect(value(parseDraft(definitionOf("payout_wallet_hold_hours"), "0"))).toBe(0);
    expect(value(parseDraft(definitionOf("snapshot_interval_seconds"), "0"))).toBe("error: Enter a whole number from 1 to 3600.");
  });

  it("countries: known codes only, without repeats, sorted", () => {
    const setting = definitionOf("restricted_countries");
    expect(value(parseDraft(setting, ["US", "CA", "US"]))).toEqual(["CA", "US"]);
    expect(value(parseDraft(setting, ["XK"]))).toBe("error: Choose countries from the list.");
  });

  it("knows a real change from the same value (countries in any order)", () => {
    expect(isChange(definitionOf("min_age_years"), 18, 18)).toBe(false);
    expect(isChange(definitionOf("min_age_years"), 18, 21)).toBe(true);
    expect(isChange(definitionOf("restricted_countries"), ["US", "CA"], ["CA", "US"])).toBe(false);
    expect(isChange(definitionOf("platform_name"), undefined, "Funded HUB")).toBe(true);
  });

  it("starts the field from the saved value, or empty when it isn't set", () => {
    expect(draftOf(definitionOf("min_age_years"), 18)).toBe("18");
    expect(draftOf(definitionOf("platform_name"), undefined)).toBe("");
    expect(draftOf(definitionOf("restricted_countries"), ["US"])).toEqual(["US"]);
  });

  it("writes values in words", () => {
    expect(formatValue(definitionOf("min_age_years"), 21)).toBe("21 years");
    expect(formatValue(definitionOf("daily_reset_utc"), "06:30")).toBe("06:30 UTC");
    expect(formatValue(definitionOf("restricted_countries"), [])).toBe("None");
    expect(formatValue(definitionOf("restricted_countries"), ["US", "CA"])).toBe("2 countries: Canada, United States");
    expect(formatValue(definitionOf("platform_name"), undefined)).toBe("Not set");
  });
});

describe("settings: when a save fails (ADM-36)", () => {
  it("shows the backend's reason for a bad value, which arrives under `input` (gap G10)", () => {
    const refused = parseErrorBody(400, { error: { code: "VALIDATION_FAILED", message: "Some fields are invalid.", fields: { input: "Too small: expected number to be >=18" } } });
    expect(saveErrorMessage(refused)).toBe("The backend refused this value: Too small: expected number to be >=18");
    const shape = parseErrorBody(400, { error: { code: "VALIDATION_FAILED", message: "Some fields are invalid.", fields: { value: "Invalid input" } } });
    expect(saveErrorMessage(shape)).toBe("The backend refused this value: Invalid input");
    const entry = parseErrorBody(400, { error: { code: "VALIDATION_FAILED", message: "Some fields are invalid.", fields: { "value.0": "Unknown ISO 3166-1 alpha-2 country code" } } });
    expect(saveErrorMessage(entry)).toBe("The backend refused this value: Unknown ISO 3166-1 alpha-2 country code");
  });

  it("warns that a value may already be saved when no answer came back", () => {
    expect(saveErrorMessage(apiError("NETWORK_ERROR", 0))).toBe(`${API_MESSAGES.NETWORK_ERROR} Check the value before trying again: it may already be saved.`);
    expect(saveErrorMessage(apiError("FORBIDDEN", 403))).toBe(API_MESSAGES.FORBIDDEN);
  });
});
