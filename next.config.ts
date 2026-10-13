import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Food photos are stored in public/images. If one can't load, a designed placeholder shows instead.
    qualities: [70, 80],
  },
};

export default nextConfig;
