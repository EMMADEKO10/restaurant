"use client"

import { CartProvider } from '@/contexts/CartContext'
import { ReactNode } from 'react'

interface CartProviderClientProps {
  children: ReactNode
}

export function CartProviderClient({ children }: CartProviderClientProps) {
  return <CartProvider>{children}</CartProvider>
} 