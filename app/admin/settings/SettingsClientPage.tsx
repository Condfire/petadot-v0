"use client"

import AdminAuthCheck from "@/components/admin-auth-check"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsClientPage() {
  return (
    <AdminAuthCheck>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <Button asChild>
            <Link href="/admin/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nome do Site</Label>
                  <Input id="site-name" defaultValue="PetAdot" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Descrição do Site</Label>
                  <Input id="site-description" defaultValue="Plataforma para adoção e localização de pets perdidos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email de Contato</Label>
                  <Input id="contact-email" type="email" defaultValue="contato@petadot.com.br" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="maintenance-mode" />
                  <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Gerenciar notificações do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Notificações por Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="new-pet-notifications" defaultChecked />
                  <Label htmlFor="new-pet-notifications">Notificar sobre novos pets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="new-user-notifications" defaultChecked />
                  <Label htmlFor="new-user-notifications">Notificar sobre novos usuários</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="new-event-notifications" defaultChecked />
                  <Label htmlFor="new-event-notifications">Notificar sobre novos eventos</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Gerenciar configurações de segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="require-email-verification" defaultChecked />
                  <Label htmlFor="require-email-verification">Exigir verificação de email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="allow-social-login" defaultChecked />
                  <Label htmlFor="allow-social-login">Permitir login social</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Tempo de sessão (minutos)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Manutenção do Sistema</CardTitle>
                <CardDescription>Ferramentas de manutenção e limpeza do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cache-clear">Limpar Cache</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="w-full">
                      Limpar Cache do Sistema
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database-backup">Backup do Banco de Dados</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="w-full">
                      Gerar Backup
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revalidate-pages">Revalidar Páginas</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="w-full" onClick={() => {}}>
                      Revalidar Todas as Páginas
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive">Reiniciar Sistema</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}
