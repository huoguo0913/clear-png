/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  poweredByHeader: false,
  // Force webpack instead of turbopack for static export
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
