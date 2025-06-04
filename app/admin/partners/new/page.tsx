import { PartnerForm } from "@/components/partner-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Verificar se o usuário é administrador
async function checkAdmin() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/partners/new")
  }

  const { data: user, error } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

  if (error || !user?.is_admin) {
    redirect("/")
  }
}

export default async function NewPartnerPage() {
  await checkAdmin()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Adicionar Novo Parceiro</h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <PartnerForm />
      </div>
    </div>
  )
}
