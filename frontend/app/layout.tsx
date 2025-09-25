import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { YogaBookingProvider } from '../contexts/YogaBookingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kshetra Retreat Resort - Book Your Perfect Stay',
  description: 'Experience tranquility at Kshetra Retreat Resort. Book rooms, yoga sessions, and adventure activities in beautiful Kerala.',
  keywords: 'resort, booking, Kerala, yoga, retreat, accommodation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <YogaBookingProvider>
          {children}
        </YogaBookingProvider>
      </body>
    </html>
  )
}