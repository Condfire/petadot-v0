import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Search, MapPin, Mail, Phone } from "lucide-react"
import { verifyOng } from "@/app/actions"

export const metadata: Metadata = {
  title: "Gerenciar ONGs | PetAdot",
  description: "Painel de administração para gerenciar ONGs",
}

export default async function AdminOngsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado e é um administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/ongs")
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

  // Buscar ONGs
  const { data: pendingOngs, error: pendingOngsError } = await supabase
    .from("users")
    .select("*")
    .eq("type", "ong")
    .eq("is_ong_verified", false)
    .order("created_at", { ascending: false })

  const { data: verifiedOngs, error: verifiedOngsError } = await supabase
    .from("users")
    .select("*")
    .eq("type", "ong")
    .eq("is_ong_verified", true)
    .order("name", { ascending: true })

  if (pendingOngsError || verifiedOngsError) {
    console.error("Erro ao buscar ONGs:", { pendingOngsError, verifiedOngsError })
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciar ONGs</h1>
        <p className="text-red-500">Erro ao carregar ONGs.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciar ONGs</h1>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard">Voltar ao Painel</Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar ONGs por nome, cidade ou estado..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pendentes ({pendingOngs?.length || 0})</TabsTrigger>
          <TabsTrigger value="verified">Verificadas ({verifiedOngs?.length || 0})</TabsTrigger>
          <TabsTrigger value="all">Todas ({(pendingOngs?.length || 0) + (verifiedOngs?.length || 0)})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>ONGs Pendentes de Verificação</CardTitle>
              <CardDescription>ONGs que se cadastraram na plataforma e aguardam verificação.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOngs && pendingOngs.length > 0 ? (
                <div className="space-y-6">
                  {pendingOngs.map((ong) => (
                    <div key={ong.id} className="border p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex gap-4">
                          {ong.logo_url && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={ong.logo_url || "/placeholder.svg"}
                                alt={ong.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-lg">{ong.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {ong.city}, {ong.state}
                            </div>
                            {ong.email && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                {ong.email}
                              </div>
                            )}
                            {ong.contact && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                {ong.contact}
                              </div>
                            )}
                            <div className="mt-2">
                              <Badge variant="outline">
                                Cadastrada em {new Date(ong.created_at).toLocaleDateString("pt-BR")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <form
                            action={async () => {
                              "use server"
                              await verifyOng(ong.id)
                            }}
                          >
                            <Button type="submit" size="sm" className="gap-1">
                              <CheckCircle className="h-4 w-4" /> Verificar
                            </Button>
                          </form>
                          <Button variant="outline" size="sm" className="gap-1">
                            <XCircle className="h-4 w-4" /> Rejeitar
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/ongs/${ong.id}`}>Detalhes</Link>
                          </Button>
                        </div>
                      </div>
                      {ong.description && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">{ong.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há ONGs pendentes de verificação.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>ONGs Verificadas</CardTitle>
              <CardDescription>ONGs que já foram verificadas e estão ativas na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {verifiedOngs && verifiedOngs.length > 0 ? (
                <div className="space-y-6">
                  {verifiedOngs.map((ong) => (
                    <div key={ong.id} className="border p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex gap-4">
                          {ong.logo_url && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={ong.logo_url || "/placeholder.svg"}
                                alt={ong.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{ong.name}</h3>
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Verificada</Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {ong.city}, {ong.state}
                            </div>
                            {ong.email && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                {ong.email}
                              </div>
                            )}
                            {ong.contact && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Phone className="h-3.5 w-3.5 mr-1" />
                                {ong.contact}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/ongs/${ong.id}`}>Gerenciar</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ongs/${ong.id}`} target="_blank">
                              Ver Perfil
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há ONGs verificadas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas as ONGs</CardTitle>
              <CardDescription>Lista completa de ONGs cadastradas na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {[...(pendingOngs || []), ...(verifiedOngs || [])].length > 0 ? (
                <div className="space-y-6">
                  {[...(pendingOngs || []), ...(verifiedOngs || [])]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((ong) => (
                      <div key={ong.id} className="border p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div className="flex gap-4">
                            {ong.logo_url && (
                              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={ong.logo_url || "/placeholder.svg"}
                                  alt={ong.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium text-lg">{ong.name}</h3>
                                {ong.is_verified ? (
                                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                                    Verificada
                                  </Badge>
                                ) : (
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {ong.city}, {ong.state}
                              </div>
                              {ong.email && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Mail className="h-3.5 w-3.5 mr-1" />
                                  {ong.email}
                                </div>
                              )}
                              {ong.contact && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Phone className="h-3.5 w-3.5 mr-1" />
                                  {ong.contact}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0">
                            {!ong.is_verified && (
                              <form
                                action={async () => {
                                  "use server"
                                  await verifyOng(ong.id)
                                }}
                              >
                                <Button type="submit" size="sm" className="gap-1">
                                  <CheckCircle className="h-4 w-4" /> Verificar
                                </Button>
                              </form>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/ongs/${ong.id}`}>{ong.is_verified ? "Gerenciar" : "Detalhes"}</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Não há ONGs cadastradas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
