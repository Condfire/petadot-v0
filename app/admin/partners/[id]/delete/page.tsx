import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { deletePartner } from "@/app/actions/partner-actions"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"

// Verificar se o usuário é administrador
async function checkAdmin() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/partners")
  }

  const { data: user, error } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

  if (error || !user?.is_admin) {
    redirect("/")
  }
}

// Buscar dados do parceiro
async function getPartner(id: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("partners").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function DeletePartnerPage({ params }: { params: { id: string } }) {
  await checkAdmin()

  const partner = await getPartner(params.id)

  if (!partner) {
    notFound()
  }

  async function handleDelete() {
    "use server"

    const result = await deletePartner(params.id)

    if (result.success) {
      redirect("/admin/partners")
    }

    return result
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Excluir Parceiro</h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-16 w-16 rounded overflow-hidden">
            <Image
              src={partner.image_url || "/placeholder.svg?height=100&width=100&query=empresa"}
              alt={partner.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{partner.name}</h2>
            <p className="text-gray-400">
              {[partner.city, partner.state].filter(Boolean).join(", ") || "Sem localização"}
            </p>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-500">Atenção</h3>
            <p className="text-gray-300 mt-1">
              Você está prestes a excluir este parceiro. Esta ação não pode ser desfeita. O parceiro será removido
              permanentemente da plataforma.
            </p>
          </div>
        </div>

        <form action={handleDelete} method="post" className="flex gap-3">
          <Button variant="destructive" type="submit">
            Confirmar Exclusão
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/partners">Cancelar</Link>
          </Button>
        </form>
      </div>
    </div>
  )
}
