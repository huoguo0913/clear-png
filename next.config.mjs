/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  poweredByHeader: false,
  experimental: {
    // Disable Turbopack for build to fix static export of dynamic routes
    turbo: undefined,
  },
};

export default nextConfig;
