import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/quiz-competition',
  images: { unoptimized: true },
};

export default nextConfig;
