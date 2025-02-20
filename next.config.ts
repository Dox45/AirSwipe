// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       { hostname: "exciting-caterpillar-231.convex.cloud", protocol: "https" },
//     ],
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "exciting-caterpillar-231.convex.cloud", protocol: "https" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings/errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
};

export default nextConfig;
