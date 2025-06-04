import { notFound, redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AdminDeleteEventForm } from "./delete-event-form"

export default async function DeleteEventPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin-alt/events/" + id + "/delete")
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

  // Buscar detalhes do evento
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

  if (eventError || !event) {
    console.error("Erro ao buscar evento:", eventError)
    notFound()
  }

  return (
    <div className="container py-8">
      <AdminDeleteEventForm event={event} />
    </div>
  )
}
