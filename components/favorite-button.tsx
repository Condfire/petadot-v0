"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  petId: string
  className?: string
}

export function FavoriteButton({ petId, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      checkIfFavorited(session.user.id)
    }
  }

  const checkIfFavorited = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("pet_id", petId)
        .single()

      if (!error && data) {
        setIsFavorited(true)
      }
    } catch (error) {
      // Pet não está nos favoritos
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar pets.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("pet_id", petId)

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível remover dos favoritos.",
            variant: "destructive",
          })
        } else {
          setIsFavorited(false)
          toast({
            title: "Removido dos favoritos",
            description: "Pet removido da sua lista de favoritos.",
          })
        }
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: user.id,
            pet_id: petId,
          },
        ])

        if (error) {
          toast({
            title: "Erro",
            description: "Não foi possível adicionar aos favoritos.",
            variant: "destructive",
          })
        } else {
          setIsFavorited(true)
          toast({
            title: "Adicionado aos favoritos",
            description: "Pet adicionado à sua lista de favoritos.",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao alterar favorito:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={className}
    >
      <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
      {isFavorited ? "Favoritado" : "Favoritar"}
    </Button>
  )
}
