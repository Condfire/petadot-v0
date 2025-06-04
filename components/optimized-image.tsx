"use client"

import Image from "next/image"

type OptimizedImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
}: OptimizedImageProps) {
  // Usar a abordagem mais simples possível
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={true}
    />
  )
}
