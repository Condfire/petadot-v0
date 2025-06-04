"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SimpleDateInputProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  required?: boolean
  min?: string
  max?: string
}

export function SimpleDateInput({
  value,
  onChange,
  label,
  placeholder,
  className,
  required,
  min,
  max,
}: SimpleDateInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="date-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id="date-input"
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full"
      />
    </div>
  )
}
