import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { deleteOng } from "@/app/actions"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const { data: ong } = await supabase.from("ongs").select("name").eq("id", params.id).single()

  return {
    title: ong ? `Excluir ${ong.name} | Administração de ONGs | PetAdot` : "Excluir ONG | PetAdot",
    description: "Excluir ONG da plataforma PetAdot",
  }
}

export default async function DeleteOngPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/ongs/" + params.id + "/delete")
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
  const { data: ong, error: ongError } = await supabase
    .from("ongs")
    .select(`
      *,
      pets(id),
      events(id)
    `)
    .eq("id", params.id)
    .single()

  if (ongError) {
    console.error("Erro ao buscar detalhes da ONG:", ongError)
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Excluir ONG</h1>
        <p className="text-red-500">Erro ao carregar detalhes da ONG.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/ongs">Voltar para lista de ONGs</Link>
        </Button>
      </div>
    )
  }

  const hasPets = ong.pets && ong.pets.length > 0
  const hasEvents = ong.events && ong.events.length > 0
  const hasRelatedData = hasPets || hasEvents

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-4 p-0 h-auto">
          <Link
            href={`/admin/ongs/${params.id}`}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Excluir ONG</h1>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Confirmação de Exclusão
          </CardTitle>
          <CardDescription>
            Você está prestes a excluir permanentemente a ONG <strong>{ong.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-md">
            {ong.logo_url && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image src={ong.logo_url || "/placeholder.svg"} alt={ong.name} fill className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-lg">{ong.name}</h3>
              <p className="text-sm text-muted-foreground">
                {ong.city}, {ong.state}
              </p>
              {ong.email && <p className="text-sm text-muted-foreground">{ong.email}</p>}
            </div>
          </div>

          {hasRelatedData && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Atenção: Esta ONG possui dados relacionados
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-amber-700 dark:text-amber-300">
                {hasPets && (
                  <li>
                    {ong.pets.length} pet{ong.pets.length !== 1 && "s"} cadastrado{ong.pets.length !== 1 && "s"}
                  </li>
                )}
                {hasEvents && (
                  <li>
                    {ong.events.length} evento{ong.events.length !== 1 && "s"} cadastrado
                    {ong.events.length !== 1 && "s"}
                  </li>
                )}
              </ul>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Ao excluir esta ONG, todos os dados relacionados também serão excluídos permanentemente.
              </p>
            </div>
          )}

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm font-medium text-destructive">
              Esta ação não pode ser desfeita. Todos os dados da ONG serão permanentemente removidos do sistema.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <form
            action={async () => {
              "use server"
              const result = await deleteOng(params.id)
              if (result.success) {
                redirect("/admin/ongs")
              }
            }}
            className="w-full sm:w-auto"
          >
            <Button type="submit" variant="destructive" className="w-full">
              Confirmar Exclusão
            </Button>
          </form>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/admin/ongs/${params.id}`}>Cancelar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
