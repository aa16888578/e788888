import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 靜態導出配置
  output: 'export',
  trailingSlash: true,
  
  // VM 環境配置
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
    typedRoutes: false,
  },
  
  // 圖片配置
  images: {
    unoptimized: true,
    domains: ['localhost', 'firebasestorage.googleapis.com', '10.140.0.2'],
  },
  
  // 環境配置
  env: {
    CUSTOM_KEY: 'cvv-bot-unified',
  },
  
  // 輸出配置
  outputFileTracingRoot: '/home/a0928997578_gmail_com/偉大',
  
  // 跳過構建時的靜態檢查（VM 環境優化）
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 實測模式 - 跳過所有檢查
  swcMinify: false,
};

export default nextConfig;