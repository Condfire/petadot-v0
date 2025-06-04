"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  storyId: string
  initialLikes: number
  isAuthenticated: boolean
}

export function LikeButton({ storyId, initialLikes = 0, isAuthenticated }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLike = async () => {
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir uma história.",
        variant: "destructive",
      })
      router.push(`/login?redirectTo=/historias`)
      return
    }

    // Evitar múltiplos cliques
    if (isLiked || isLoading) return

    // Atualizar estado local imediatamente para feedback visual
    setIsLoading(true)
    setIsLiked(true)
    setLikes((prev) => prev + 1)

    try {
      // Fazer a requisição para o servidor
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        // Se a requisição falhar, reverter o estado local
        setLikes((prev) => prev - 1)
        setIsLiked(false)
        toast({
          title: "Erro ao curtir",
          description: "Não foi possível curtir esta história. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } else {
        // Se a requisição for bem-sucedida, mostrar mensagem de sucesso
        toast({
          title: "História curtida!",
          description: "Obrigado por curtir esta história.",
        })
        // Atualizar a página para refletir a mudança
        router.refresh()
      }
    } catch (error) {
      // Em caso de erro, reverter o estado local
      console.error("Erro ao curtir história:", error)
      setLikes((prev) => prev - 1)
      setIsLiked(false)
      toast({
        title: "Erro ao curtir",
        description: "Ocorreu um erro ao curtir a história. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
      <span>{likes}</span>
    </Button>
  )
}
