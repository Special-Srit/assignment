import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/assignment',
  images: { unoptimized: true },
};

export default nextConfig;
