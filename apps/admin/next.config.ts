import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { assertAdminEnv } from "./src/config/env";

const nextConfig: NextConfig = {
  transpilePackages: ["@funded-hub/ui", "@funded-hub/config"],
  poweredByHeader: false,
  devIndicators: { position: "bottom-right" },
};

const CHECKED_PHASES = [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER];

export default function config(phase: string): NextConfig {
  // Settings check (ADM-07): `next dev`, `next build` and `next start` stop here with a clear
  // message when apps/admin/.env.local (or the host's settings) is missing a value.
  // `next typegen`, part of the type check, also loads this file as a "build", but it doesn't
  // need real settings, so it is skipped.
  const typegenOnly = process.argv.includes("typegen");
  if (CHECKED_PHASES.includes(phase) && !typegenOnly) assertAdminEnv();
  return nextConfig;
}
