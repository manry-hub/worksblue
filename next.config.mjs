/** @type {import('next').NextConfig} */
const nextConfig = {
  /* No transpiled packages needed for now */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
