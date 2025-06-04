"use client"

import { ImageUploadManager } from "./image-upload-manager"

interface OngLogoUploadProps {
  ongId: string
  value: string
  onChange: (url: string) => void
  className?: string
}

export default function OngLogoUpload({ ongId, value, onChange, className }: OngLogoUploadProps) {
  return (
    <ImageUploadManager
      category="ongs"
      value={value}
      onChange={onChange}
      userId={ongId}
      label="Logo da ONG"
      description="Faça upload do logo da sua organização (PNG, JPG ou SVG até 3MB)"
      className={className}
    />
  )
}
