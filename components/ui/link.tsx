import type React from "react"
import NextLink from "next/link"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface LinkProps extends React.ComponentProps<typeof NextLink> {
  className?: string
}

export const Link = forwardRef<React.ElementRef<typeof NextLink>, LinkProps>(({ className, ...props }, ref) => {
  return <NextLink ref={ref} className={cn("text-primary underline-offset-4 hover:underline", className)} {...props} />
})

Link.displayName = "Link"

export default Link
