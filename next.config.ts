import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Food photography is served from Unsplash. Every image falls back to a
    // designed placeholder if it cannot load (offline, blocked network, etc.).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    qualities: [70, 80],
  },
};

export default nextConfig;
