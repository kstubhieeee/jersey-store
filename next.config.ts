import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
