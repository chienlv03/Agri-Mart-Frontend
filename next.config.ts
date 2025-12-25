import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      { protocol: 'http', 
        hostname: 'localhost', 
        port: '9000',
        pathname: '/**'
      },
    ],
  },
};

export default nextConfig;
