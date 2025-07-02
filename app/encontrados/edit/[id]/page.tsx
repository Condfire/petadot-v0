import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FoundPetForm from "@/components/FoundPetForm"

export default async function EditFoundPetPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/encontrados/edit/" + params.id)
  }

  // Buscar os dados do pet encontrado na tabela unificada
  const { data: pet, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !pet) {
    console.error("Erro ao buscar pet encontrado:", error)
    redirect("/my-pets?error=pet-not-found")
  }

  // Verificar se o usuário é o dono do pet
  if (pet.user_id !== session.user.id) {
    redirect("/my-pets?error=unauthorized")
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Pet Encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <FoundPetForm initialData={pet} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}
