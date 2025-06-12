import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

export default async function EditOngPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/ongs/" + id + "/edit")
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

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/ongs/${id}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar ONG</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Formulário de edição da ONG */}
        <form className="space-y-6">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Funcionalidade em desenvolvimento. Por favor, use o painel de administração principal para editar ONGs.
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/admin/ongs/${id}`}>Ir para o gerenciamento de ONGs</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
