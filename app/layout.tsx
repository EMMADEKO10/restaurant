import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Système de Gestion de Restaurant',
  description: 'Plateforme complète pour gérer les opérations de votre restaurant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 