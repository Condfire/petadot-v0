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
import { Loader2, RefreshCw, PlusCircle, Trash2, Edit, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type ModerationSetting = {
  id: string
  setting_key: string
  setting_value: any
  description: string
}

type Keyword = {
  id: string
  keyword: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function SettingsClientPage() {
  const [settings, setSettings] = useState<ModerationSetting[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null)
  const [editingKeywordValue, setEditingKeywordValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettingsAndKeywords()
  }, [])

  async function fetchSettingsAndKeywords() {
    setIsLoading(true)
    try {
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("moderation_settings")
        .select("*")
        .order("setting_key")

      if (settingsError) throw settingsError

      // If no settings, create defaults
      if (!settingsData || settingsData.length === 0) {
        await createDefaultSettings()
      } else {
        setSettings(settingsData)
      }

      // Fetch keywords
      const { data: keywordsData, error: keywordsError } = await supabase
        .from("moderation_keywords")
        .select("*")
        .order("keyword")

      if (keywordsError) throw keywordsError
      setKeywords(keywordsData || [])
    } catch (error) {
      console.error("Erro ao buscar configurações ou palavras-chave:", error)
      setMessage({ type: "error", text: "Erro ao carregar configurações ou palavras-chave" })
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
      {
        setting_key: "enable_keyword_moderation",
        setting_value: { enabled: false },
        description: "Habilitar moderação automática de posts por palavras-chave",
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

      toast({ title: "Sucesso", description: "Configuração salva com sucesso." })
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      toast({ title: "Erro", description: "Erro ao salvar configuração.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function addKeyword() {
    if (!newKeyword.trim()) {
      toast({ title: "Erro", description: "A palavra-chave não pode ser vazia.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from("moderation_keywords")
        .insert([{ keyword: newKeyword.trim().toLowerCase(), is_active: true }])
        .select()

      if (error) throw error

      setKeywords((prev) => [...prev, data[0]])
      setNewKeyword("")
      toast({ title: "Sucesso", description: "Palavra-chave adicionada." })
    } catch (error: any) {
      console.error("Erro ao adicionar palavra-chave:", error)
      if (error.code === "23505") {
        // Unique violation
        toast({ title: "Erro", description: "Esta palavra-chave já existe.", variant: "destructive" })
      } else {
        toast({ title: "Erro", description: "Erro ao adicionar palavra-chave.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function updateKeywordStatus(id: string, isActive: boolean) {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("moderation_keywords")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setKeywords((prev) => prev.map((k) => (k.id === id ? { ...k, is_active: isActive } : k)))
      toast({ title: "Sucesso", description: "Status da palavra-chave atualizado." })
    } catch (error) {
      console.error("Erro ao atualizar status da palavra-chave:", error)
      toast({ title: "Erro", description: "Erro ao atualizar status da palavra-chave.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteKeyword(id: string) {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("moderation_keywords").delete().eq("id", id)

      if (error) throw error

      setKeywords((prev) => prev.filter((k) => k.id !== id))
      toast({ title: "Sucesso", description: "Palavra-chave removida." })
    } catch (error) {
      console.error("Erro ao remover palavra-chave:", error)
      toast({ title: "Erro", description: "Erro ao remover palavra-chave.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  async function saveEditedKeyword(id: string) {
    if (!editingKeywordValue.trim()) {
      toast({ title: "Erro", description: "A palavra-chave não pode ser vazia.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from("moderation_keywords")
        .update({ keyword: editingKeywordValue.trim().toLowerCase(), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()

      if (error) throw error

      setKeywords((prev) => prev.map((k) => (k.id === id ? { ...k, keyword: data[0].keyword } : k)))
      setEditingKeywordId(null)
      setEditingKeywordValue("")
      toast({ title: "Sucesso", description: "Palavra-chave editada." })
    } catch (error: any) {
      console.error("Erro ao editar palavra-chave:", error)
      if (error.code === "23505") {
        // Unique violation
        toast({ title: "Erro", description: "Esta palavra-chave já existe.", variant: "destructive" })
      } else {
        toast({ title: "Erro", description: "Erro ao editar palavra-chave.", variant: "destructive" })
      }
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
        <Button onClick={fetchSettingsAndKeywords} variant="outline" disabled={isLoading}>
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
          <Card className="mb-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Moderação por Palavras-Chave</CardTitle>
              <CardDescription>
                Bloqueie posts que contenham palavras-chave específicas (ex: "venda", "comprar", "preço").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar moderação por palavras-chave</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative para bloquear posts com palavras-chave proibidas.
                  </p>
                </div>
                <Switch
                  checked={getSetting("enable_keyword_moderation")?.setting_value?.enabled || false}
                  onCheckedChange={(checked) => updateSetting("enable_keyword_moderation", { enabled: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-4">
                <Label>Palavras-Chave Bloqueadas</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Adicionar nova palavra-chave"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault() // Prevent form submission
                        addKeyword()
                      }
                    }}
                    disabled={isSaving}
                  />
                  <Button onClick={addKeyword} disabled={isSaving}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                  </Button>
                </div>
                <ul className="space-y-2">
                  {keywords.map((kw) => (
                    <li key={kw.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      {editingKeywordId === kw.id ? (
                        <Input
                          value={editingKeywordValue}
                          onChange={(e) => setEditingKeywordValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              saveEditedKeyword(kw.id)
                            }
                          }}
                          className="flex-grow mr-2"
                        />
                      ) : (
                        <span className={`font-medium ${!kw.is_active ? "line-through text-muted-foreground" : ""}`}>
                          {kw.keyword}
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={kw.is_active}
                          onCheckedChange={(checked) => updateKeywordStatus(kw.id, checked)}
                          disabled={isSaving || editingKeywordId === kw.id}
                        />
                        {editingKeywordId === kw.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveEditedKeyword(kw.id)}
                              disabled={isSaving}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingKeywordId(null)
                                setEditingKeywordValue("")
                              }}
                              disabled={isSaving}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingKeywordId(kw.id)
                              setEditingKeywordValue(kw.keyword)
                            }}
                            disabled={isSaving}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteKeyword(kw.id)} disabled={isSaving}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
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
