"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface ReportPetButtonProps {
  petId: string
  className?: string
}

export function ReportPetButton({ petId, className }: ReportPetButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleReport = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para denunciar um pet",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const { error } = await supabase.from("pet_reports").insert({
        pet_id: petId,
        user_id: session.user.id,
      })

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a denúncia.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Denúncia enviada",
          description: "Obrigado por reportar este pet.",
        })
      }
    } catch (err) {
      console.error("Erro ao denunciar pet:", err)
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
    <Button onClick={handleReport} disabled={loading} className={className} variant="outline" size="sm">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
      Denunciar
    </Button>
  )
}
