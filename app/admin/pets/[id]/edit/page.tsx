import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PetEditForm } from "./pet-edit-form"

export const metadata: Metadata = {
  title: "Editar Pet | Admin PetAdot",
  description: "Editar informações do pet",
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

export default async function EditPetPage({ params }: { params: { id: string } }) {
  const pet = await getPet(params.id)

  if (!pet) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Pets
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Pet</h1>
        <p className="text-muted-foreground">
          Editando: {pet.name} • Categoria:{" "}
          {pet.category === "adoption" ? "Adoção" : pet.category === "lost" ? "Perdido" : "Encontrado"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pet</CardTitle>
          <CardDescription>
            Edite as informações do pet. Proprietário: {pet.users?.name} ({pet.users?.email})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PetEditForm pet={pet} />
        </CardContent>
      </Card>
    </div>
  )
}
