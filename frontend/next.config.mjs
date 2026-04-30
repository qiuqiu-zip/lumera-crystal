import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolveLoader ??= {};
    config.resolveLoader.alias ??= {};

    // Some environments fail to resolve Next internal loaders from CWD.
    // Pin these aliases explicitly to avoid "Can't resolve next-middleware-loader".
    config.resolveLoader.alias["next-middleware-loader"] = require.resolve(
      "next/dist/build/webpack/loaders/next-middleware-loader"
    );
    config.resolveLoader.alias["next-middleware-asset-loader"] = require.resolve(
      "next/dist/build/webpack/loaders/next-middleware-asset-loader"
    );
    config.resolveLoader.alias["next-middleware-wasm-loader"] = require.resolve(
      "next/dist/build/webpack/loaders/next-middleware-wasm-loader"
    );

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000"
      }
    ]
  }
};

export default nextConfig;
