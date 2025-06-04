"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw } from "lucide-react"

type ModerationSetting = {
  id: string
  setting_key: string
  setting_value: any
  description: string
}

export default function SettingsClientPage() {
  const [settings, setSettings] = useState<ModerationSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from("moderation_settings").select("*").order("setting_key")

      if (error) throw error

      // Se não há configurações, criar as padrões
      if (!data || data.length === 0) {
        await createDefaultSettings()
        return
      }

      setSettings(data)
    } catch (error) {
      console.error("Erro ao buscar configurações:", error)
      setMessage({ type: "error", text: "Erro ao carregar configurações" })
    } finally {
      setIsLoading(false)
    }
  }

  async function createDefaultSettings() {
    const defaultSettings = [
      {
        setting_key: "auto_approve_pets",
        setting_value: { enabled: false },
        description: "Aprovar automaticamente pets para adoção",
      },
      {
        setting_key: "auto_approve_lost_pets",
        setting_value: { enabled: false },
        description: "Aprovar automaticamente pets perdidos",
      },
      {
        setting_key: "auto_approve_found_pets",
        setting_value: { enabled: false },
        description: "Aprovar automaticamente pets encontrados",
      },
      {
        setting_key: "auto_approve_events",
        setting_value: { enabled: false },
        description: "Aprovar automaticamente eventos",
      },
      {
        setting_key: "notification_email",
        setting_value: { email: "admin@petadot.com" },
        description: "Email para notificações administrativas",
      },
      {
        setting_key: "max_images_per_pet",
        setting_value: { count: 5 },
        description: "Número máximo de imagens por pet",
      },
      {
        setting_key: "require_phone_verification",
        setting_value: { enabled: true },
        description: "Exigir verificação de telefone para cadastros",
      },
    ]

    try {
      const { data, error } = await supabase.from("moderation_settings").insert(defaultSettings).select()

      if (error) throw error

      setSettings(data)
      setMessage({ type: "success", text: "Configurações padrão criadas com sucesso" })
    } catch (error) {
      console.error("Erro ao criar configurações padrão:", error)
      setMessage({ type: "error", text: "Erro ao criar configurações padrão" })
    }
  }

  async function updateSetting(settingKey: string, newValue: any) {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("moderation_settings")
        .update({
          setting_value: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", settingKey)

      if (error) throw error

      // Atualizar estado local
      setSettings((prev) =>
        prev.map((setting) => (setting.setting_key === settingKey ? { ...setting, setting_value: newValue } : setting)),
      )

      setMessage({ type: "success", text: "Configuração salva com sucesso" })
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      setMessage({ type: "error", text: "Erro ao salvar configuração" })
    } finally {
      setIsSaving(false)
    }
  }

  const getSetting = (key: string) => {
    return settings.find((s) => s.setting_key === key)
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Gerencie as configurações da plataforma</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "error" ? "border-destructive" : "border-green-500"}`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="moderation">Moderação</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Moderação</CardTitle>
              <CardDescription>Configure como o conteúdo é moderado na plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovar pets para adoção automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Novos pets para adoção serão aprovados automaticamente
                  </p>
                </div>
                <Switch
                  checked={getSetting("auto_approve_pets")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("auto_approve_pets", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovar pets perdidos automaticamente</Label>
                  <p className="text-sm text-muted-foreground">Novos pets perdidos serão aprovados automaticamente</p>
                </div>
                <Switch
                  checked={getSetting("auto_approve_lost_pets")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("auto_approve_lost_pets", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovar pets encontrados automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Novos pets encontrados serão aprovados automaticamente
                  </p>
                </div>
                <Switch
                  checked={getSetting("auto_approve_found_pets")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("auto_approve_found_pets", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprovar eventos automaticamente</Label>
                  <p className="text-sm text-muted-foreground">Novos eventos serão aprovados automaticamente</p>
                </div>
                <Switch
                  checked={getSetting("auto_approve_events")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("auto_approve_events", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Configure como e quando receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email para notificações</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={getSetting("notification_email")?.setting_value?.email || ""}
                  onChange={(e) => updateSetting("notification_email", { email: e.target.value })}
                  placeholder="admin@petadot.com"
                />
                <p className="text-sm text-muted-foreground">Email que receberá notificações administrativas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Limites do Sistema</CardTitle>
              <CardDescription>Configure limites e restrições da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-images">Máximo de imagens por pet</Label>
                <Input
                  id="max-images"
                  type="number"
                  min="1"
                  max="10"
                  value={getSetting("max_images_per_pet")?.setting_value?.count || 5}
                  onChange={(e) => updateSetting("max_images_per_pet", { count: Number.parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">Número máximo de imagens que podem ser enviadas por pet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Configure medidas de segurança e verificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exigir verificação de telefone</Label>
                  <p className="text-sm text-muted-foreground">Usuários devem verificar o telefone ao se cadastrar</p>
                </div>
                <Switch
                  checked={getSetting("require_phone_verification")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("require_phone_verification", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
