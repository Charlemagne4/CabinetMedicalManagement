/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  //
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  webpack(config, { isServer }) {
    if (isServer) {
      // Ensure thread-stream is loaded as a commonjs external if needed
      config.externals ||= [];
      config.externals.push({
        "thread-stream": "commonjs thread-stream",
      });
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
    ],
  },
};

export default config;
