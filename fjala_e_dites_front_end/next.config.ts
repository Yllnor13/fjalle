import type { NextConfig } from "next";

const variant = process.env.APP_VARIANT || "original";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',

  distDir: variant === "fjalaedites" ? "out-fjalaedites" : "out-ordetidag"
};

export default nextConfig;
