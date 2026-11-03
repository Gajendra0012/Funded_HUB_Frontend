/**
 * Settings (ADM-36): the rules behind the screen, kept apart from it so they can be tested.
 * The backend checks every value again (`settingSchemas` in its admin service); the checks here only
 * catch a mistake before a request is sent.
 */
import countryList from "../../contract/country-codes.json";
import { outcomeUnknown, type ApiError } from "./api/errors";
import type { Schemas } from "./api/types";

export type SettingRecord = Schemas["SettingRecord"];
export type SettingKey = SettingRecord["key"];
export type SettingValue = SettingRecord["value"];

export type SettingGroup = "signup" | "platform" | "trading";

type Base = {
  key: SettingKey;
  label: string;
  group: SettingGroup;
  /** Does anything read this setting yet? Checked against backend dev 1d4c8bf: update when it starts reading one. */
  inUse: boolean;
  /** What reading it does, or why nothing does yet. */
  usedBy: string;
};

export type SettingDefinition =
  | (Base & { kind: "text" | "email"; maxLength: number; placeholder: string })
  | (Base & { kind: "time" })
  | (Base & { kind: "number"; min: number; max: number; unit: string })
  | (Base & { kind: "countries" });

export const SETTING_GROUPS: readonly { id: SettingGroup; title: string; description: string }[] = [
  { id: "signup", title: "Trader sign-up", description: "The website's sign-up checks these on every new account." },
  { id: "platform", title: "Platform", description: "The firm's name and contact address." },
  { id: "trading", title: "Trading and payouts", description: "Saved for the risk engine and payouts, which don't read them yet." },
];

/** The 7 settings the API supports (tests/settings.test.ts keeps this list equal to the contract's). */
export const SETTINGS: readonly SettingDefinition[] = [
  {
    key: "restricted_countries",
    kind: "countries",
    label: "Restricted countries",
    group: "signup",
    inUse: true,
    usedBy: "Sign-up refuses traders from these countries, and the website shows the list.",
  },
  {
    key: "min_age_years",
    kind: "number",
    min: 18,
    max: 100,
    unit: "years",
    label: "Minimum age",
    group: "signup",
    inUse: true,
    usedBy: "Sign-up refuses a date of birth younger than this.",
  },
  {
    key: "platform_name",
    kind: "text",
    maxLength: 120,
    placeholder: "e.g. Funded HUB",
    label: "Platform name",
    group: "platform",
    inUse: false,
    usedBy: "Nothing reads it yet.",
  },
  {
    key: "support_email",
    kind: "email",
    maxLength: 320,
    placeholder: "e.g. support@fundedhub.com",
    label: "Support email",
    group: "platform",
    inUse: false,
    usedBy: "Nothing reads it yet.",
  },
  {
    key: "daily_reset_utc",
    kind: "time",
    label: "Daily reset time (UTC)",
    group: "trading",
    inUse: false,
    usedBy: "Nothing reads it yet: the risk rules use 00:00 UTC until live account checks start.",
  },
  {
    key: "snapshot_interval_seconds",
    kind: "number",
    min: 1,
    max: 3600,
    unit: "seconds",
    label: "Snapshot interval",
    group: "trading",
    inUse: false,
    usedBy: "Nothing reads it yet: account snapshots come later.",
  },
  {
    key: "payout_wallet_hold_hours",
    kind: "number",
    min: 0,
    max: 720,
    unit: "hours",
    label: "Payout wallet hold",
    group: "trading",
    inUse: false,
    usedBy: "Nothing reads it yet: each program's payout policy sets its own wallet hold.",
  },
];

// ─── Countries ──────────────────────────────────────────────────────────────────────────────────

/** The 249 ISO codes the API accepts (contract/country-codes.json, a copy of the backend's list: gap G16). */
export const COUNTRY_CODES: readonly string[] = countryList.codes;

const regionNames = new Intl.DisplayNames(["en"], { type: "region", fallback: "code" });

/** "AE" → "United Arab Emirates". */
export function countryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function byName(a: string, b: string): number {
  return countryName(a).localeCompare(countryName(b));
}

/** Countries whose name or code contains the search, by name. */
export function searchCountries(search: string): string[] {
  const needle = search.trim().toLowerCase();
  return COUNTRY_CODES.filter((code) => !needle || code.toLowerCase().includes(needle) || countryName(code).toLowerCase().includes(needle)).sort(byName);
}

/** What a country change does, by name: added countries can't sign up any more, removed ones can again. */
export function countryChanges(before: readonly string[], after: readonly string[]): { added: string[]; removed: string[] } {
  return {
    added: after.filter((code) => !before.includes(code)).sort(byName),
    removed: before.filter((code) => !after.includes(code)).sort(byName),
  };
}

// ─── Drafts: what's typed, checked before sending ───────────────────────────────────────────────

export type Draft = string | string[];

export function definitionOf(key: SettingKey): SettingDefinition {
  const found = SETTINGS.find((setting) => setting.key === key);
  if (!found) throw new Error(`Unknown setting ${key}`);
  return found;
}

/** What the edit field starts with: the saved value, or empty when it isn't set yet. */
export function draftOf(setting: SettingDefinition, saved: SettingValue | undefined): Draft {
  if (setting.kind === "countries") return Array.isArray(saved) ? [...saved] : [];
  return saved === undefined || Array.isArray(saved) ? "" : String(saved);
}

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

/** The value to send, or why it can't be sent. Mirrors the backend's rules for each key. */
export function parseDraft(setting: SettingDefinition, draft: Draft): { value: SettingValue } | { error: string } {
  if (setting.kind === "countries") {
    const codes = Array.isArray(draft) ? draft : [];
    if (codes.some((code) => !COUNTRY_CODES.includes(code))) return { error: "Choose countries from the list." };
    // Sorted, so the same countries always save the same way.
    return { value: [...new Set(codes)].sort() };
  }
  const text = typeof draft === "string" ? draft.trim() : "";
  switch (setting.kind) {
    case "text":
      return text && text.length <= setting.maxLength ? { value: text } : { error: `Enter 1 to ${setting.maxLength} characters.` };
    case "email":
      return EMAIL.test(text) && text.length <= setting.maxLength ? { value: text } : { error: "Enter a valid email address." };
    case "time":
      return TIME.test(text) ? { value: text } : { error: "Enter a time as HH:mm, 24-hour, in UTC." };
    case "number": {
      const number = /^[0-9]+$/.test(text) ? Number(text) : NaN;
      return Number.isInteger(number) && number >= setting.min && number <= setting.max
        ? { value: number }
        : { error: `Enter a whole number from ${setting.min} to ${setting.max}.` };
    }
  }
}

/** True when the value would change what's saved (countries compare as sets). */
export function isChange(setting: SettingDefinition, saved: SettingValue | undefined, value: SettingValue): boolean {
  if (saved === undefined) return true;
  const normal = (v: SettingValue) => (setting.kind === "countries" && Array.isArray(v) ? [...v].sort() : v);
  return JSON.stringify(normal(saved)) !== JSON.stringify(normal(value));
}

/** A value in words: "21 years", "3 countries: …", "None". */
export function formatValue(setting: SettingDefinition, value: SettingValue | undefined): string {
  if (value === undefined) return "Not set";
  if (setting.kind === "countries") {
    const codes = Array.isArray(value) ? [...value].sort(byName) : [];
    if (!codes.length) return "None";
    return `${codes.length} ${codes.length === 1 ? "country" : "countries"}: ${codes.map(countryName).join(", ")}`;
  }
  if (setting.kind === "number") return `${String(value)} ${setting.unit}`;
  if (setting.kind === "time") return `${String(value)} UTC`;
  return String(value);
}

/** What the dialog says when a save fails. */
export function saveErrorMessage(error: ApiError): string {
  if (outcomeUnknown(error)) return `${error.message} Check the value before trying again: it may already be saved.`;
  if (error.code === "VALIDATION_FAILED") {
    // The backend reports a bad value under "input" (gap G10), under "value" for the request's own shape,
    // or under "value.0" etc. for one entry of a list.
    const field = error.fields?.input ?? error.fields?.value ?? Object.values(error.fields ?? {})[0];
    return field ? `The backend refused this value: ${field}` : error.message;
  }
  return error.message;
}
