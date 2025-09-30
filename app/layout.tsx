import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Карьерный Навигатор - Самодиагностика конкурентоспособности на рынке труда',
  description:
    'Оцените свой карьерный потенциал через психометрические тесты. Сравните навыки с требованиями регионального рынка труда России и получите персональные рекомендации по развитию карьеры.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
