/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kabary/ui"],
  allowedDevOrigins: ["192.168.43.55"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
