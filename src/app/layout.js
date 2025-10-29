import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Main metadata export (WITHOUT viewport and themeColor)
export const metadata = {
  title: 'DietPredict - AI-Powered Nutrition Planning',
  description: 'Transform your eating habits with personalized meal plans',
  keywords: 'diet, nutrition, meal planning, AI, health',
  authors: [{ name: 'DietPredict Team' }],
  // ... other metadata
}

// NEW: Separate viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea', // Move themeColor here
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}