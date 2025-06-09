"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, className }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (!file) {
        return
      }

      setUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch("/api/upload", {
          // Replace with your upload endpoint
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.url) {
          setPreview(result.url)
          if (typeof onImageUploaded === "function") {
            onImageUploaded(result.url)
          } else {
            console.error("ImageUpload: onImageUploaded is not a function", onImageUploaded)
            // Optionally set an error state here
          }
          setUploading(false)
          setError(null)
        } else if (result.error) {
          setError(result.error)
          setUploading(false)
        } else {
          setError("Upload failed.")
          setUploading(false)
        }
      } catch (e: any) {
        setError(e.message || "Upload failed.")
        setUploading(false)
      }
    },
    [onImageUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  })

  return (
    <div className={`border-2 border-dashed rounded-md p-4 relative ${className || ""}`}>
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        {uploading ? (
          <div className="text-center">Uploading...</div>
        ) : preview ? (
          <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-48 w-full object-contain" />
        ) : isDragActive ? (
          <div className="text-center">Drop the image here...</div>
        ) : (
          <div className="text-center">Drag 'n' drop an image here, or click to select one</div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}

export default ImageUpload
