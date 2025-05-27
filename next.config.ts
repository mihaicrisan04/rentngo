import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to allow deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionally ignore TypeScript errors during builds
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_CONVEX_URL?.replace("https://", "").replace("http://", "") ?? "ceaseless-trout-193.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
