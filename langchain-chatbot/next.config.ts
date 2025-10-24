import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: true,
  },
  output: "standalone", // allows Vercel to package everything correctly
  reactStrictMode: true,
};

export default nextConfig;
