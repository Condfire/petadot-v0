import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Novo Usuário | Admin PetAdot",
  description: "Criar novo usuário no sistema",
}

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Usuários
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
        <p className="text-muted-foreground">Criar um novo usuário no sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Preencha os dados do novo usuário.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_admin" name="is_admin" />
              <Label htmlFor="is_admin">Usuário Administrador</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Criar Usuário</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/users">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
