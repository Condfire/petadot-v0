"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { uploadFile } from "@/lib/storage-manager" // Assuming you have this utility
import { toast } from "@/components/ui/use-toast" // Or your preferred toast library

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
  folder?: string // Optional: to specify upload folder/category
  label?: string
  description?: string
  required?: boolean
  value?: string // To show existing image
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  className,
  folder = "temp", // Default folder
  label = "Upload Image",
  description,
  required = false,
  value,
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
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
        // Using storage-manager for upload
        const { publicUrl, error: uploadError } = await uploadFile(file, folder as any) // Cast folder if needed by uploadFile

        if (uploadError) {
          throw new Error(uploadError.message || "Upload failed.")
        }

        if (publicUrl) {
          setPreview(publicUrl)
          if (typeof onImageUploaded === "function") {
            onImageUploaded(publicUrl)
          } else {
            console.error("[ImageUpload] onImageUploaded is not a function:", onImageUploaded)
            toast({
              title: "Error",
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
        toast({
          title: "Upload Error",
          description: e.message || "Could not upload image.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [onImageUploaded, folder],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    multiple: false,
  })

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer
        ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}
        ${error ? "border-red-500" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            {/* You can use a spinner component here */}
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
          <div className="relative group">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="max-h-48 w-auto mx-auto object-contain rounded"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <span className="text-white text-sm">Change image</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* You can use an upload icon here */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-gray-400 mb-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            {isDragActive ? <p>Drop the image here...</p> : <p>Drag 'n' drop an image here, or click to select</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
