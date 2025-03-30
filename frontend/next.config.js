/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  
    async rewrites() {
      return [
        {
          source: "/:path*",
          destination: "/index.html",
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  