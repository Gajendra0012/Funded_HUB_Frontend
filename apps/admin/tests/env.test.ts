import { afterEach, describe, expect, it } from "vitest";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } from "next/constants";
import config from "../next.config";
import { assertAdminEnv, checkAdminEnv, type RawAdminEnv } from "../src/config/env";

const LOCAL: RawAdminEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_testkey",
  NEXT_PUBLIC_ADMIN_API_URL: "http://127.0.0.1:4000/",
};

describe("admin settings check (ADM-07)", () => {
  it("accepts the local settings and drops a trailing slash from the API address", () => {
    expect(checkAdminEnv(LOCAL)).toEqual({
      env: { supabaseUrl: "http://127.0.0.1:54321", supabasePublishableKey: "sb_publishable_testkey", adminApiUrl: "http://127.0.0.1:4000" },
      problems: [],
    });
  });

  it("accepts https addresses for staging and production", () => {
    const { env, problems } = checkAdminEnv({
      ...LOCAL,
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_ADMIN_API_URL: "https://api.example.com/v1",
    });
    expect(problems).toEqual([]);
    expect(env?.adminApiUrl).toBe("https://api.example.com/v1");
  });

  it("lists every missing value at once", () => {
    const { env, problems } = checkAdminEnv({
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  ",
      NEXT_PUBLIC_ADMIN_API_URL: "",
    });
    expect(env).toBeUndefined();
    expect(problems).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL is missing.",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.",
      "NEXT_PUBLIC_ADMIN_API_URL is missing.",
    ]);
  });

  it("refuses a secret key, which must never reach the browser", () => {
    const { problems } = checkAdminEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("SECRET key");
  });

  it("refuses a key that is not a publishable key", () => {
    const { problems } = checkAdminEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOi.legacy.anon" });
    expect(problems[0]).toContain("must be a publishable key");
  });

  it("refuses plain http for anything but this computer, and malformed addresses", () => {
    expect(checkAdminEnv({ ...LOCAL, NEXT_PUBLIC_ADMIN_API_URL: "http://api.example.com" }).problems[0]).toContain("must use https");
    expect(checkAdminEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_URL: "not a url" }).problems[0]).toContain("not a valid address");
    expect(checkAdminEnv({ ...LOCAL, NEXT_PUBLIC_ADMIN_API_URL: "http://127.0.0.1:4000/?x=1" }).problems[0]).toContain('without "?" or "#"');
  });

  it("throws one clear message with every problem and how to fix it", () => {
    expect(() => assertAdminEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_URL: undefined, NEXT_PUBLIC_ADMIN_API_URL: undefined })).toThrowError(
      /Admin app settings are missing or wrong:\n {2}- NEXT_PUBLIC_SUPABASE_URL is missing\.\n {2}- NEXT_PUBLIC_ADMIN_API_URL is missing\.\nCopy apps\/admin\/\.env\.example/,
    );
  });
});

describe("startup check in next.config.ts (ADM-07)", () => {
  const saved = { ...process.env };
  const savedArgv = [...process.argv];
  const clearSettings = () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_ADMIN_API_URL;
  };
  afterEach(() => {
    process.env = { ...saved };
    process.argv = [...savedArgv];
  });

  it("stops `next dev`, `next build` and `next start` when settings are missing", () => {
    clearSettings();
    for (const phase of [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]) {
      expect(() => config(phase), phase).toThrowError(/Admin app settings are missing or wrong/);
    }
  });

  it("starts when the settings are present", () => {
    Object.assign(process.env, LOCAL);
    expect(config(PHASE_DEVELOPMENT_SERVER).poweredByHeader).toBe(false);
  });

  it("does not need settings for tests or for `next typegen` (part of the type check)", () => {
    clearSettings();
    expect(() => config(PHASE_TEST)).not.toThrow();
    process.argv = [...savedArgv, "typegen"];
    expect(() => config(PHASE_PRODUCTION_BUILD)).not.toThrow();
  });
});
