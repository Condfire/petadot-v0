"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OtherOptionFieldProps {
  isOtherSelected?: boolean
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  placeholder?: string
}

export default function OtherOptionField({
  isOtherSelected = false,
  value,
  onChange,
  label,
  required = false,
  placeholder = "Digite sua opção",
}: OtherOptionFieldProps) {
  if (!isOtherSelected) {
    return null
  }

  return (
    <div className="mt-2">
      {label && (
        <Label htmlFor="other-input" className="flex">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id="other-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required && isOtherSelected}
      />
    </div>
  )
}
