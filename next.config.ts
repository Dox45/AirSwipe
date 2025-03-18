import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "exciting-caterpillar-231.convex.cloud", protocol: "https" },
      {
        protocol: "https",
        hostname: "wooden-wombat-55.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
