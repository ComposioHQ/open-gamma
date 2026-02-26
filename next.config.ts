import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  allowedDevOrigins: process.env.AUTH_URL ? [new URL(process.env.AUTH_URL).hostname] : [],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "docs.google.com",
      },
    ],
  },
};

export default nextConfig;
