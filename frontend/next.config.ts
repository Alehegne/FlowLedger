import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8082/api/:path*",
      },
    ];
  },
};

// async function rewrites() {
//   return [
//     {
//         source: "/api/:path*",
//         destination: "http://localhost:8082/api/:path*",
//     }
//   ]
// }
export default nextConfig;
