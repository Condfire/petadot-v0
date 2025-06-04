import { notFound, redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AdminDeleteOngForm } from "./delete-ong-form"

export default async function DeleteOngPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin-alt/ongs/" + id + "/delete")
  }

  // Verificar se o usuário é um administrador
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (userError || !user?.is_admin) {
    redirect("/")
  }

  // Buscar detalhes da ONG
  const { data: ong, error: ongError } = await supabase.from("users").select("*").eq("id", id).single()

  if (ongError || !ong) {
    console.error("Erro ao buscar ONG:", ongError)
    notFound()
  }

  // Buscar pets da ONG
  const { data: pets, error: petsError } = await supabase.from("pets").select("id").eq("user_id", id)

  if (petsError) {
    console.error("Erro ao buscar pets da ONG:", petsError)
  }

  const petCount = pets?.length || 0

  return (
    <div className="container py-8">
      <AdminDeleteOngForm ong={ong} petCount={petCount} />
    </div>
  )
}
