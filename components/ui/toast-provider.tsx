"use client"

import { createContext, useContext, ReactNode } from "react"
import { Toaster, useToaster, Toast } from "./toaster"

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast, toast } = useToaster()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
} 