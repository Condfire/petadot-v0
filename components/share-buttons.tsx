"use client"

import { Button } from "@/components/ui/button"

interface ShareButtonsProps {
  title: string
}

export function ShareButtons({ title }: ShareButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
              "_blank",
            )
          }
        }}
      >
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                window.location.href,
              )}&text=${encodeURIComponent(title)}`,
              "_blank",
            )
          }
        }}
      >
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.open(
              `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${window.location.href}`)}`,
              "_blank",
            )
          }
        }}
      >
        WhatsApp
      </Button>
    </div>
  )
}
