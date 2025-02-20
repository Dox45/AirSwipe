import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "exciting-caterpillar-231.convex.cloud", protocol: "https" },
    ],
  },
};

export default nextConfig;
