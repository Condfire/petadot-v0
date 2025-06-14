"use client"

import { ImageUploadManager } from "./image-upload-manager"
import type { ImageCategory } from "@/lib/storage-manager"

interface ImageUploadProps {
  value: string // A URL da imagem atual
  onChange: (url: string) => void // Callback para quando a imagem muda
  required?: boolean
  folder?: string
  className?: string
  label?: string
  description?: string
  userId?: string // Adicionando a prop userId
}

export function ImageUpload({
  // Exportação nomeada restaurada
  value,
  onChange,
  required = false,
  folder = "pets",
  className = "",
  label = "Imagem",
  description,
  userId, // Destruturando userId
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
      value={value} // Passa o 'value' recebido para o ImageUploadManager
      onChange={onChange} // Passa o 'onChange' recebido para o ImageUploadManager
      label={label}
      description={description}
      required={required}
      className={className}
      userId={userId} // Passando o userId para o ImageUploadManager
    />
  )
}

export default ImageUpload // Exportação padrão mantida
