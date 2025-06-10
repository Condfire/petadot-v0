"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import OngLogoUpload from "@/components/ong-logo-upload"

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }).max(18),
  address: z.string().min(5, { message: "Endereço muito curto" }),
  city: z.string().min(2, { message: "Cidade inválida" }),
  state: z.string().length(2, { message: "Estado deve ter 2 caracteres (ex: SP)" }),
  contact: z.string().min(8, { message: "Contato inválido" }),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  logo_url: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function OngProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [ong, setOng] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      description: "",
      cnpj: "",
      address: "",
      city: "",
      state: "",
      contact: "",
      website: "",
      logo_url: "",
    },
  })

  useEffect(() => {
    async function loadOngData() {
      try {
        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push("/ongs/login?message=Faça login para acessar o dashboard")
          return
        }

        const userId = session.user.id

        // Buscar dados da ONG
        const { data: ongData, error: ongError } = await supabase
          .from("ongs")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (ongError || !ongData) {
          console.error("Erro ao buscar dados da ONG:", ongError)
          setError("Não foi possível carregar os dados da ONG")
          setIsLoading(false)
          return
        }

        setOng(ongData)
        setLogoUrl(ongData.logo_url || null)

        // Preencher o formulário com os dados da ONG
        form.reset({
          name: ongData.name || "",
          description: ongData.description || "",
          cnpj: ongData.cnpj || "",
          address: ongData.address || "",
          city: ongData.city || "",
          state: ongData.state || "",
          contact: ongData.contact || "",
          website: ongData.website || "",
          logo_url: ongData.logo_url || "",
        })
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Ocorreu um erro ao carregar os dados")
      } finally {
        setIsLoading(false)
      }
    }

    loadOngData()
  }, [router, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Atualizar com a URL do logo se foi alterada
      if (logoUrl) {
        data.logo_url = logoUrl
      }

      const { error } = await supabase
        .from("ongs")
        .update({
          name: data.name,
          description: data.description,
          cnpj: data.cnpj,
          address: data.address,
          city: data.city,
          state: data.state,
          contact: data.contact,
          website: data.website,
          logo_url: data.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ong.id)

      if (error) {
        throw new Error(error.message)
      }

      setSuccess("Perfil atualizado com sucesso!")

      // Atualizar os dados locais
      setOng({
        ...ong,
        ...data,
      })
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      setError("Ocorreu um erro ao atualizar o perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = (url: string) => {
    setLogoUrl(url)
    form.setValue("logo_url", url)
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Perfil da ONG</h1>
          <p className="text-muted-foreground">Atualize as informações da sua organização</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/ongs/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logo da ONG</CardTitle>
            <CardDescription>Faça upload do logo da sua organização</CardDescription>
          </CardHeader>
          <CardContent>
            {ong && (
              <OngLogoUpload
                ongId={ong.id}
                value={logoUrl || ""}
                onChange={handleLogoUpload}
                className="w-full aspect-square object-cover rounded-md"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da ONG</CardTitle>
            <CardDescription>Atualize os dados da sua organização</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da ONG</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da sua organização" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone ou email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.seusite.com.br" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a missão e o trabalho da sua organização"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
