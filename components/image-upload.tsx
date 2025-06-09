"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { uploadFile, type ImageCategory } from "@/lib/storage-manager" // Ensure ImageCategory is imported if used for typing folder
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Trash2, UploadCloud } from "lucide-react"

interface ImageUploadProps {
  onImageUploaded: (url: string, path?: string) => void // path is optional but good to have
  onImageRemoved?: (url: string) => void // Optional: callback when image is removed
  className?: string
  folder?: ImageCategory // Use the exported type
  label?: string
  description?: string
  required?: boolean
  value?: string // To show existing image URL
  userId?: string // Optional: if uploads are user-specific
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  className,
  folder = "temp",
  label = "Upload Image",
  description,
  required = false,
  value,
  userId,
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (value) {
      setPreview(value)
    } else {
      setPreview(null) // Clear preview if value is removed externally
    }
  }, [value])

  const handleRemoveImage = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation() // Prevent triggering dropzone if button is inside
    const oldPreview = preview
    setPreview(null)
    setError(null)
    if (typeof onImageUploaded === "function") {
      onImageUploaded("") // Notify parent that image is removed by passing empty string or undefined
    }
    if (oldPreview && typeof onImageRemoved === "function") {
      onImageRemoved(oldPreview) // Specific callback for removal
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setError(null)
      setPreview(URL.createObjectURL(file)) // Optimistic preview

      try {
        const { publicUrl, path, error: uploadError } = await uploadFile(file, folder, userId)

        if (uploadError) {
          throw new Error(uploadError.message || "Upload failed.")
        }

        if (publicUrl) {
          setPreview(publicUrl) // Update with actual URL
          if (typeof onImageUploaded === "function") {
            onImageUploaded(publicUrl, path)
          } else {
            console.error("[ImageUpload] onImageUploaded is not a function:", onImageUploaded)
            toast({
              title: "Configuration Error",
              description: "Image upload callback is misconfigured.",
              variant: "destructive",
            })
          }
        } else {
          throw new Error("Upload failed to return a URL.")
        }
      } catch (e: any) {
        console.error("[ImageUpload] Upload error:", e)
        setError(e.message || "Upload failed.")
        setPreview(value || null) // Revert to original value on error
        toast({
          title: "Upload Error",
          description: e.message || "Could not upload image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [onImageUploaded, folder, userId, value],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
      "image/svg+xml": [],
    },
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"}
        ${error ? "border-destructive" : ""}
        ${uploading ? "cursor-not-allowed opacity-70" : ""}
        ${preview ? "p-2" : "p-6"}`} // Adjust padding if preview exists
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <svg
              className="animate-spin h-8 w-8 text-primary mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Uploading...</span>
          </div>
        ) : preview ? (
          <div className="relative group aspect-video max-h-60 mx-auto">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-contain rounded"
              onError={() => {
                // Handle broken image links if necessary
                setError("Could not load preview image.")
                setPreview(null)
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  getRootProps().onClick!(e as any)
                }}
              >
                Change
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 ml-2"
                onClick={handleRemoveImage}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <UploadCloud className="h-12 w-12 mb-2" />
            {isDragActive ? <p>Drop the image here...</p> : <p>Drag 'n' drop an image, or click to select</p>}
            <p className="text-xs mt-1">PNG, JPG, GIF, WEBP, SVG</p>
          </div>
        )}
      </div>
      {description && !preview && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}

// Provide both named and default export
export { ImageUploadComponent as ImageUpload }
export default ImageUploadComponent
