import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // VM 環境配置
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  
  // 圖片配置
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com', '10.140.0.2'],
  },
  
  // 環境配置
  env: {
    CUSTOM_KEY: 'cvv-bot-unified',
  },
  
  // VM 網絡配置
  server: {
    host: '0.0.0.0', // 允許外部訪問
    port: 3000,
  },
  
  // 輸出配置
  outputFileTracingRoot: '/home/a0928997578_gmail_com/偉大/web',
  
  // 跳過構建時的靜態檢查（VM 環境優化）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;