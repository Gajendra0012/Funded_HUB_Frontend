import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@funded-hub/ui"],
  poweredByHeader: false,
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
