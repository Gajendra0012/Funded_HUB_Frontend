/**
 * The trader's display identity (name, email, country) from their Supabase user (WEB-10).
 * Email sign-up stores first_name / last_name / country_code; Google gives full_name or name.
 * The dashboard's store keeps this as its `session`, so the existing screens show the real trader.
 */
import type { Session } from "@/lib/types";

type UserLike = { email?: string | null; user_metadata?: Record<string, unknown> | null };

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function identityFromUser(user: UserLike): Session {
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const fromParts = `${text(meta.first_name)} ${text(meta.last_name)}`.trim();
  const name = fromParts || text(meta.full_name) || text(meta.name) || email.split("@")[0] || "Trader";
  const country = text(meta.country_code).toUpperCase();
  return { name, email, country: /^[A-Z]{2}$/.test(country) ? country : "" };
}

/** "Alex Morgan" → { first_name: "Alex", last_name: "Morgan" } for sign-up metadata. */
export function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  const first_name = parts.shift() ?? "";
  return { first_name, last_name: parts.join(" ") };
}
