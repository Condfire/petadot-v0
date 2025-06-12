import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, MailIcon, PhoneIcon, ClockIcon, ArrowLeftIcon, PawPrintIcon } from "lucide-react"

export default async function OngDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin-alt/ongs/" + id)
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
  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("id, name, species, breed, category, status, main_image_url")
    .eq("user_id", id)
    .order("created_at", { ascending: false })

  if (petsError) {
    console.error("Erro ao buscar pets da ONG:", petsError)
  }

  // Formatar data de criação
  const createdAt = new Date(ong.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin-alt/ongs">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da ONG</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{ong.name}</CardTitle>
                  <CardDescription>ID: {ong.id}</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Cadastrada
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
                  {ong.logo_url ? (
                    <Image src={ong.logo_url || "/placeholder.svg"} alt={ong.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem logo</div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {ong.city}, {ong.state}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{ong.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{ong.contact || "Não informado"}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Cadastrada em {createdAt}</span>
                  </div>
                </div>
              </div>

              {ong.description && (
                <div>
                  <h3 className="font-medium mb-2">Descrição</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{ong.description}</p>
                </div>
              )}

              {ong.cnpj && (
                <div>
                  <h3 className="font-medium mb-2">CNPJ</h3>
                  <p className="text-muted-foreground">{ong.cnpj}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-4">Pets da ONG ({pets?.length || 0})</h3>
                {pets && pets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {pets.slice(0, 6).map((pet) => (
                      <Link
                        key={pet.id}
                        href={`/admin-alt/pets/${pet.id}/edit`}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={pet.main_image_url || "/placeholder.svg?height=64&width=64&query=pet"}
                              alt={pet.name || "Pet"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{pet.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {pet.species} {pet.breed && `• ${pet.breed}`}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                pet.status === "approved"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : pet.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                              }
                            >
                              {pet.status === "approved"
                                ? "Aprovado"
                                : pet.status === "pending"
                                  ? "Pendente"
                                  : "Rejeitado"}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Esta ONG ainda não cadastrou nenhum pet.</p>
                )}
                {pets && pets.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <Link href={`/admin-alt/pets?ong=${id}`}>
                        Ver todos os {pets.length} pets <PawPrintIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {null}

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/ongs/${ong.slug || ong.id}`} target="_blank">
                  Ver Perfil no Site
                </Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin-alt/ongs/${ong.id}/edit`}>Editar ONG</Link>
              </Button>

              <Button variant="destructive" className="w-full" asChild>
                <Link href={`/admin-alt/ongs/${ong.id}/delete`}>Excluir ONG</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Total de Pets</div>
                  <div className="text-2xl font-bold">{pets?.length || 0}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Pets para Adoção</div>
                  <div className="text-2xl font-bold">
                    {pets?.filter((pet) => pet.category === "adoption").length || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Pets Perdidos</div>
                  <div className="text-2xl font-bold">{pets?.filter((pet) => pet.category === "lost").length || 0}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Pets Encontrados</div>
                  <div className="text-2xl font-bold">
                    {pets?.filter((pet) => pet.category === "found").length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
