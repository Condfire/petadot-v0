import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Trash2, ShieldCheck, ArrowLeft } from "lucide-react"

export default async function AdminUsersPage() {
  const supabase = createServerComponentClient({ cookies })

  // Buscar todos os usuários
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, created_at, is_admin")
    .order("created_at", { ascending: false })

  // Separar usuários regulares e administradores
  const regularUsers = users?.filter((user) => !user.is_admin) || []
  const adminUsers = users?.filter((user) => user.is_admin) || []

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" /> Novo Administrador
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="regular">
        <TabsList className="mb-4">
          <TabsTrigger value="regular">Usuários Regulares ({regularUsers.length})</TabsTrigger>
          <TabsTrigger value="admin">Administradores ({adminUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <div className="grid grid-cols-1 gap-4">
            {regularUsers.length > 0 ? (
              regularUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{user.name || "Usuário sem nome"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registrado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}/promote`}>
                            <ShieldCheck className="mr-2 h-4 w-4" /> Promover
                          </Link>
                        </Button>
                        <Button asChild variant="destructive" size="sm">
                          <Link href={`/admin/users/${user.id}/delete`}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum usuário regular encontrado.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="admin">
          <div className="grid grid-cols-1 gap-4">
            {adminUsers.length > 0 ? (
              adminUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name || "Administrador sem nome"}</h3>
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Admin</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registrado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="destructive" size="sm">
                          <Link href={`/admin/users/${user.id}/delete`}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum administrador encontrado.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
