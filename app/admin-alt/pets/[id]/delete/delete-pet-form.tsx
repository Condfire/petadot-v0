"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function DeletePetForm({ petId, petName }: { petId: string; petName: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    if (confirmText !== "EXCLUIR") {
      toast.error("Digite 'EXCLUIR' para confirmar")
      return
    }

    setIsLoading(true)

    try {
      // Try to delete related stories from both possible tables
      // We'll ignore errors if tables don't exist
      try {
        // Try pet_stories table first
        await supabase.from("pet_stories").delete().eq("pet_id", petId)
        console.log("Deleted related stories from pet_stories table")
      } catch (error) {
        console.log("No pet_stories table or no related stories found", error)
      }

      try {
        // Try success_stories table as fallback
        await supabase.from("success_stories").delete().eq("pet_id", petId)
        console.log("Deleted related stories from success_stories table")
      } catch (error) {
        console.log("No success_stories table or no related stories found", error)
      }

      // Now delete the pet
      const { error } = await supabase.from("pets").delete().eq("id", petId)

      if (error) {
        console.error("Erro ao excluir pet:", error)
        toast.error(`Erro ao excluir pet: ${error.message}`)
        return
      }

      toast.success("Pet excluído com sucesso!")
      router.push("/admin-alt/pets")
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir pet:", error)
      toast.error(`Erro ao excluir pet: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="confirm">
          Para confirmar a exclusão de <strong>{petName || "este pet"}</strong>, digite <strong>EXCLUIR</strong> no
          campo abaixo:
        </Label>
        <Input
          id="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Digite EXCLUIR para confirmar"
        />
      </div>

      <div className="flex gap-4">
        <Button variant="destructive" onClick={handleDelete} disabled={isLoading || confirmText !== "EXCLUIR"}>
          {isLoading ? "Excluindo..." : "Excluir Pet Permanentemente"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
