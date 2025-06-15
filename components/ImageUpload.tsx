"use client"

import { ImageUploadManager } from "./image-upload-manager"
import type { ImageCategory } from "@/lib/storage-manager"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  required?: boolean
  folder?: string
  className?: string
  label?: string
  description?: string
  userId?: string
}

export function ImageUpload({
  value,
  onChange,
  required = false,
  folder = "pets",
  className = "",
  label = "Imagem",
  description,
  userId,
}: ImageUploadProps) {
  // Mapear folder para categoria
  const getCategoryFromFolder = (folder: string): ImageCategory => {
    const folderMap: Record<string, ImageCategory> = {
      pets: "pets",
      pets_adoption: "pets",
      pets_lost: "pets",
      pets_found: "pets",
      events: "events",
      avatars: "avatars",
      ongs: "ongs",
      temp: "temp",
    }
    return folderMap[folder] || "pets"
  }

  return (
    <ImageUploadManager
      category={getCategoryFromFolder(folder)}
      value={value}
      onChange={onChange}
      label={label}
      description={description || "Selecione uma imagem de boa qualidade. Ela será otimizada automaticamente."}
      required={required}
      className={className}
      userId={userId}
    />
  )
}

export default ImageUpload
