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
      {
        protocol: "https",
        hostname: "as1.ftcdn.net",       // Cho background pattern lá
        port: "",
        pathname: "/**",                 // Cho phép mọi path
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com", // Cho illustration nông dân và logo
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
