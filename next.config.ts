import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false,
  },
  env: {
    API_KEY: process.env.API_KEY,
  },
  eslint: {
    // Это позволит завершить сборку успешно, даже если в проекте есть ошибки ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
