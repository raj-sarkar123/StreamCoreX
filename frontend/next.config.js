/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'output: export' only for Tauri production builds:
  //   STATIC_EXPORT=1 npm run build
  ...(process.env.STATIC_EXPORT ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
