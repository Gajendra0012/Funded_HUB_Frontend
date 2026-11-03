import { afterEach, describe, expect, it } from "vitest";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } from "next/constants";
import { checkAddress, isLocalAddress } from "@funded-hub/config";
import config from "../next.config";
import { assertWebEnv, checkWebEnv, type RawWebEnv } from "../src/config/env";

const LOCAL: RawWebEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_testkey",
  NEXT_PUBLIC_API_URL: "http://127.0.0.1:4000/",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000/",
};

describe("website settings check (WEB-03)", () => {
  it("accepts the local settings and drops trailing slashes", () => {
    expect(checkWebEnv(LOCAL)).toEqual({
      env: {
        supabaseUrl: "http://127.0.0.1:54321",
        supabasePublishableKey: "sb_publishable_testkey",
        apiUrl: "http://127.0.0.1:4000",
        siteUrl: "http://127.0.0.1:3000",
      },
      problems: [],
    });
  });

  it("accepts https addresses for staging and production", () => {
    const { env, problems } = checkWebEnv({
      ...LOCAL,
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_API_URL: "https://api.example.com/v1",
      NEXT_PUBLIC_SITE_URL: "https://www.example.com",
    });
    expect(problems).toEqual([]);
    expect(env?.apiUrl).toBe("https://api.example.com/v1");
    expect(env?.siteUrl).toBe("https://www.example.com");
  });

  it("lists every missing value at once", () => {
    const { env, problems } = checkWebEnv({
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  ",
      NEXT_PUBLIC_API_URL: "",
      NEXT_PUBLIC_SITE_URL: undefined,
    });
    expect(env).toBeUndefined();
    expect(problems).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL is missing.",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.",
      "NEXT_PUBLIC_API_URL is missing.",
      "NEXT_PUBLIC_SITE_URL is missing.",
    ]);
  });

  it("refuses a secret key, which must never reach the browser", () => {
    const { problems } = checkWebEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("SECRET key");
  });

  it("refuses plain http for anything but this computer, and malformed addresses", () => {
    expect(checkWebEnv({ ...LOCAL, NEXT_PUBLIC_SITE_URL: "http://www.example.com" }).problems[0]).toContain("must use https");
    expect(checkWebEnv({ ...LOCAL, NEXT_PUBLIC_API_URL: "not a url" }).problems[0]).toContain("not a valid address");
  });

  it("wants only the site's own address, since email links are built from it", () => {
    expect(checkWebEnv({ ...LOCAL, NEXT_PUBLIC_SITE_URL: "https://www.example.com/app" }).problems[0]).toContain("without a path");
    expect(checkWebEnv({ ...LOCAL, NEXT_PUBLIC_SITE_URL: "https://www.example.com/?ref=x" }).problems[0]).toContain('without "?" or "#"');
  });

  it("throws one clear message with every problem and how to fix it", () => {
    expect(() => assertWebEnv({ ...LOCAL, NEXT_PUBLIC_SUPABASE_URL: undefined, NEXT_PUBLIC_SITE_URL: undefined })).toThrowError(
      /Website settings are missing or wrong:\n {2}- NEXT_PUBLIC_SUPABASE_URL is missing\.\n {2}- NEXT_PUBLIC_SITE_URL is missing\.\nCopy apps\/web\/\.env\.example/,
    );
  });
});

describe("shared settings rules (packages/config)", () => {
  it("knows which addresses are on this computer", () => {
    expect(isLocalAddress("http://127.0.0.1:4000")).toBe(true);
    expect(isLocalAddress("http://localhost:3000")).toBe(true);
    expect(isLocalAddress("http://[::1]:3000")).toBe(true);
    expect(isLocalAddress("https://api.example.com")).toBe(false);
  });

  it("keeps a backend path but not the trailing slash", () => {
    const problems: string[] = [];
    expect(checkAddress("X", "https://api.example.com/v1/", problems)).toBe("https://api.example.com/v1");
    expect(problems).toEqual([]);
  });
});

describe("startup check in next.config.ts (WEB-03)", () => {
  const saved = { ...process.env };
  const savedArgv = [...process.argv];
  const clearSettings = () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  };
  afterEach(() => {
    process.env = { ...saved };
    process.argv = [...savedArgv];
  });

  it("stops `next dev`, `next build` and `next start` when settings are missing", () => {
    clearSettings();
    for (const phase of [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]) {
      expect(() => config(phase), phase).toThrowError(/Website settings are missing or wrong/);
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
