/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // transpilePackages: ['@repo/ui'],
  compiler: { styledComponents: true },
  output: 'standalone',
};

module.exports = nextConfig;
