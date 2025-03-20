import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false,
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
