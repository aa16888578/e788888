import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GMS CVV CARDING - 智能信用卡管理後台',
  description: '專業的信用卡數據管理系統，支持智能分類AI、入庫/出庫管理、搜尋和分類等功能',
  keywords: ['信用卡', '管理後台', 'AI分類', '數據管理'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-gradient-dark min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
