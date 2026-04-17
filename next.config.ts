import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
      incomingRequests: {
          ignore: [/\/api\/health/],
      },
      serverFunctions: true,
      fetches: {
          fullUrl: true,
          hmrRefreshes: false,
      },
      browserToTerminal: true,
  }
};

export default nextConfig;
