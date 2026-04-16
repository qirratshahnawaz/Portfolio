import type { NextConfig } from "next";
import path from "path";

// Resolve the absolute path to the project root once.
// Using a relative "." causes Turbopack to scan based on the process CWD,
// which can be a massive directory and makes the filesystem cache take 60+ seconds.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty.ts" },
      net: { browser: "./empty.ts" },
      tls: { browser: "./empty.ts" },
      crypto: { browser: "./empty.ts" },
    },
  },

  // Webpack configuration (used by `npm run build`, not Turbopack dev server)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // Ignore build errors for bleeding-edge deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
