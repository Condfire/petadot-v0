"use client"

import type { ReactNode } from "react"

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnimateOnScroll({ children, className = "", delay = 0 }: AnimateOnScrollProps) {
  // Versão simplificada sem animação para evitar problemas
  return <div className={className}>{children}</div>
}
