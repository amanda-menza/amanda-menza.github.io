import { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add image settings
  images: {
    domains: ["abroad.colab.duke.edu"],
    unoptimized: true,
  },
  // Add output settings for static files
  output: "standalone",
};

export default nextConfig;
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     unoptimized: true,
//   },
// };

// export default nextConfig;
