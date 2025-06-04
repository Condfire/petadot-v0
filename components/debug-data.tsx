"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DebugDataProps {
  data: any
  title?: string
}

export default function DebugData({ data, title = "Dados de Depuração" }: DebugDataProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? "Ocultar" : "Mostrar"}
        </Button>
      </div>

      {isVisible && (
        <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
