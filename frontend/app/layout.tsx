import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { YogaBookingProvider } from '../contexts/YogaBookingContext'
import { Toaster } from 'react-hot-toast'

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
      <body className={inter.className} suppressHydrationWarning={true}>
        <YogaBookingProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </YogaBookingProvider>
      </body>
    </html>
  )
}