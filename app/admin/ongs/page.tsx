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

  // Buscar todas as ONGs
  const { data: verifiedOngs, error: ongsError } = await supabase
    .from("ongs")
    .select(
      "id, name, city, state, logo_url, contact_email, contact_phone, mission, slug"
    )
    .order("name", { ascending: true })

  if (ongsError) {
    console.error("Erro ao buscar ONGs:", ongsError)
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

      <div className="space-y-6">
        {verifiedOngs && verifiedOngs.length > 0 ? (
          verifiedOngs.map((ong) => (
            <div key={ong.id} className="border p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex gap-4">
                  {ong.logo_url && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={ong.logo_url || "/placeholder.svg"} alt={ong.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{ong.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {ong.city}, {ong.state}
                    </div>
                    {ong.contact_email && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        {ong.contact_email}
                      </div>
                    )}
                    {ong.contact_phone && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        {ong.contact_phone}
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
              {ong.mission && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{ong.mission}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Não há ONGs cadastradas.</p>
        )}
      </div>
    </div>
  )
}
