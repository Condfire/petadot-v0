"use client"

import { useState } from "react"
import { Share2, Facebook, Twitter, Copy, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
  className?: string
}

export function ShareButton({ url, title, description, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  // Usar a URL atual se nenhuma for fornecida
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const shareTitle = title || "Compartilhar"
  const shareDescription = description || "Confira este conteúdo interessante!"

  // Função para compartilhar nativamente (se disponível)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        })
        toast({
          title: "Compartilhado com sucesso!",
          description: "O conteúdo foi compartilhado.",
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Se o compartilhamento nativo não estiver disponível, copiar o link
      copyToClipboard()
    }
  }

  // Função para compartilhar no Facebook
  const shareOnFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}&quote=${encodeURIComponent(shareDescription)}`
    window.open(fbShareUrl, "_blank")
  }

  // Função para compartilhar no Twitter
  const shareOnTwitter = () => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareDescription,
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterShareUrl, "_blank")
  }

  // Função para compartilhar no WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
      `${shareTitle}\n${shareDescription}\n${shareUrl}`,
    )}`
    window.open(whatsappShareUrl, "_blank")
  }

  // Função para copiar o link para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true)
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência.",
        })
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error("Erro ao copiar:", err)
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navigator.share && (
          <DropdownMenuItem onClick={shareNative}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Compartilhar</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="mr-2 h-4 w-4" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="mr-2 h-4 w-4" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          <span>{copied ? "Copiado!" : "Copiar link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
