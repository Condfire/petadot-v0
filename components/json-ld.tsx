"use client"

import { useEffect, useState } from "react"

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[]
}

export default function JsonLd({ data }: JsonLdProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Só renderiza no lado do cliente para evitar erros de hidratação
  if (!mounted) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}
