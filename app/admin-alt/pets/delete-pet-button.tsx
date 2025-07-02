"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DeletePetButtonProps {
  petId: string
  petName: string
  petType: string
}

export function DeletePetButton({ petId, petName, petType }: DeletePetButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o pet "${petName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsDeleting(true)

    try {
      console.log(`Excluindo pet ${petId} (${petType}) do painel admin`)

      // Use the unified pets table with no user_id check for admin
      const { error } = await supabase.from("pets").delete().eq("id", petId)

      if (error) {
        console.error("Erro ao excluir pet:", error)
        throw error
      }

      toast({
        title: "Pet excluído",
        description: `O pet "${petName}" foi excluído com sucesso.`,
      })

      // Revalidar páginas
      try {
        await fetch("/api/revalidate?path=/admin-alt/pets")
        await fetch("/api/revalidate?path=/admin-alt/moderation")

        if (petType === "adoption") {
          await fetch("/api/revalidate?path=/adocao")
        } else if (petType === "lost") {
          await fetch("/api/revalidate?path=/perdidos")
        } else if (petType === "found") {
          await fetch("/api/revalidate?path=/encontrados")
        }
      } catch (revalidateError) {
        console.error("Erro ao revalidar páginas:", revalidateError)
      }

      // Redirecionar para a lista de pets
      router.push("/admin-alt/pets")
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir pet",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
      Excluir
    </Button>
  )
}
