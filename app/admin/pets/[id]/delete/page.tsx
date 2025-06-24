import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DeletePetForm } from "./delete-pet-form"
import Image from "next/image"
import { mapPetSpecies } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Excluir Pet | Admin PetAdot",
  description: "Excluir pet do sistema",
}

async function getPet(id: string) {
  try {
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*, users!pets_user_id_fkey(name, email)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar pet:", error)
      return null
    }

    return pet
  } catch (error) {
    console.error("Erro ao buscar pet:", error)
    return null
  }
}

export default async function DeletePetPage({ params }: { params: { id: string } }) {
  const pet = await getPet(params.id)

  if (!pet) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Pets
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Excluir Pet</h1>
        <p className="text-muted-foreground">Esta ação não pode ser desfeita.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Confirmar Exclusão</CardTitle>
          <CardDescription>Você está prestes a excluir permanentemente este pet do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex gap-4">
              {pet.main_image_url && (
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={pet.main_image_url || "/placeholder.svg"}
                    alt={pet.name || "Pet"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium">{pet.name || "Sem nome"}</h3>
                <p className="text-sm text-muted-foreground">
                  {mapPetSpecies(pet.species)} {pet.breed && `• ${pet.breed}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pet.city}, {pet.state}
                </p>
                <p className="text-sm text-muted-foreground">
                  Categoria:{" "}
                  {pet.category === "adoption" ? "Adoção" : pet.category === "lost" ? "Perdido" : "Encontrado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Proprietário: {pet.users?.name} ({pet.users?.email})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">Atenção!</h4>
            <p className="text-sm text-muted-foreground">Esta ação irá excluir permanentemente:</p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
              <li>Todas as informações do pet</li>
              <li>Todas as imagens associadas</li>
              <li>Histórico de moderação</li>
              <li>Possíveis histórias de sucesso relacionadas</li>
            </ul>
          </div>

          <DeletePetForm petId={pet.id} petName={pet.name} />
        </CardContent>
      </Card>
    </div>
  )
}
