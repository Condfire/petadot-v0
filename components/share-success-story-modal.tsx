"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ShareSuccessStoryModalProps {
  petId: string
  petType: "adoption" | "lost" | "found"
  petName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareSuccessStoryModal({
  petId,
  petType,
  petName = "",
  open = true,
  onOpenChange,
}: ShareSuccessStoryModalProps) {
  const [isOpen, setIsOpenInternal] = useState(open)
  const [title, setTitle] = useState("")
  const [story, setStory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // Usuário não está autenticado, fechar o modal e redirecionar para login
        handleOpenChange(false)
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para compartilhar uma história.",
        })
        router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  // Sincronizar o estado interno com a prop open
  useEffect(() => {
    setIsOpenInternal(open)
  }, [open])

  // Definir título padrão com base no tipo de pet
  useEffect(() => {
    const defaultTitles = {
      adoption: `História de adoção${petName ? ` de ${petName}` : ""}`,
      lost: `Como encontrei ${petName || "meu pet"} perdido`,
      found: `Como reuni ${petName || "este pet"} com seu tutor`,
    }

    setTitle(defaultTitles[petType] || "Minha história de sucesso")
  }, [petType, petName])

  // Função para lidar com mudanças no estado do modal
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpenInternal(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !story.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a história.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Verificar novamente a autenticação antes de enviar
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        handleOpenChange(false)
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para compartilhar uma história.",
        })
        router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      // Importar a action do servidor
      const { createSuccessStory } = await import("@/app/actions/success-story-actions")

      // Criar FormData
      const formData = new FormData()
      formData.append("title", title)
      formData.append("story", story)
      formData.append("petId", petId)
      formData.append("petType", petType)
      if (imageUrl) {
        formData.append("imageUrl", imageUrl)
      }

      // Usar a action do servidor
      const result = await createSuccessStory(formData)

      if (!result.success) {
        throw new Error(result.error || "Erro ao compartilhar história")
      }

      toast({
        title: "História compartilhada!",
        description: "Sua história foi compartilhada com sucesso.",
      })

      handleOpenChange(false)

      // Redirecionar para a página da história
      if (result.data?.id) {
        router.push(`/historias/${result.data.id}`)
      } else {
        router.push("/historias")
      }
    } catch (error) {
      console.error("Erro ao compartilhar história:", error)
      toast({
        title: "Erro ao compartilhar história",
        description: "Ocorreu um erro ao compartilhar sua história. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se estiver verificando autenticação, não renderizar o conteúdo ainda
  if (isCheckingAuth) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Compartilhe sua história de sucesso</DialogTitle>
            <DialogDescription>
              Conte como foi a experiência de{" "}
              {petType === "adoption" ? "adotar" : petType === "lost" ? "encontrar" : "reunir"} seu pet. Sua história
              pode inspirar outras pessoas!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dê um título para sua história"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story">Sua história</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Conte como foi a experiência..."
                className="min-h-[150px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image-upload">Foto (opcional)</Label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Compartilhando...
                </span>
              ) : (
                "Compartilhar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
