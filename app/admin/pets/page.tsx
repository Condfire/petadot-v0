import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PetsTable } from "./pets-table"

export default async function AdminPetsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/pets")
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single()

  if (userError || !user?.is_admin) {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciar Pets</h1>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">Voltar ao Painel</Link>
        </Button>
      </div>
      <PetsTable />
    </div>
  )
}
