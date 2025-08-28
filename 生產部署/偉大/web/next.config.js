/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: 'shopbot-unified',
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
