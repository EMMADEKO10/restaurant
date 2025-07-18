import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { CartProviderClient } from '@/components/providers/CartProviderClient'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Restaurant Management',
  description: 'Application de gestion de restaurant',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Restaurant',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Restaurant',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Restaurant" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ToastProvider>
            <CartProviderClient>
              {children}
            </CartProviderClient>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 