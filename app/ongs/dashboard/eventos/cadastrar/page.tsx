"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ImageUpload from "@/components/ImageUpload" // Importação corrigida para o componente ImageUpload
import { mapEventUIToDB } from "@/lib/mappers"
import type { EventFormUI } from "@/lib/types" // Importar o tipo EventFormUI

// Schema de validação para o formulário de eventos
const eventFormSchema = z.object({
  name: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }), // Renomeado de title para name
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  location: z.string().min(5, { message: "Informe o local do evento" }),
  start_date_ui: z.string().min(1, { message: "Selecione a data do evento" }), // Renomeado para start_date_ui
  start_time_ui: z.string().min(1, { message: "Informe o horário do evento" }), // Renomeado para start_time_ui
  image_url: z.string().optional(),
  event_type: z.string().min(1, { message: "Selecione o tipo de evento" }), // Adicionado tipo de evento
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function CadastrarEventoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null) // Estado para a URL da imagem
  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      start_date_ui: "",
      start_time_ui: "",
      image_url: "",
      event_type: "",
    },
  })

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Valores do formulário antes do mapeamento:", data)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/ongs/login?message=Faça login para cadastrar eventos")
        return
      }

      const userId = session.user.id

      const { data: ongData, error: ongError } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

      if (ongError || !ongData) {
        throw new Error("ONG não encontrada ou você não está associado a uma ONG.")
      }

      // Adicionar a URL da imagem se foi enviada
      const dataWithImageUrl: EventFormUI = {
        ...data,
        image_url: imageUrl || undefined, // Usar o estado imageUrl
      } as EventFormUI // Forçar o tipo para EventFormUI

      // Usar o mapper para converter dados da UI para o formato do banco de dados
      const eventData = mapEventUIToDB(dataWithImageUrl, ongData.id, userId)

      const { error: eventError } = await supabase.from("events").insert({
        ...eventData,
        ong_id: ongData.id,
        user_id: userId,
        status: "approved", // Evento publicado imediatamente
        created_at: new Date().toISOString(),
      })

      if (eventError) {
        throw new Error(eventError.message)
      }

      router.push("/ongs/dashboard?success=Evento cadastrado com sucesso")
    } catch (err: any) {
      console.error("Erro ao cadastrar evento:", err)
      setError(err.message || "Ocorreu um erro ao cadastrar o evento.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para lidar com o upload da imagem
  const handleImageChange = (url: string) => {
    setImageUrl(url)
    form.setValue("image_url", url) // Atualiza o valor no formulário também
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/ongs/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Evento</h1>
          <p className="text-muted-foreground">Adicione um novo evento da sua ONG</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Imagem do Evento</CardTitle>
            <CardDescription>Faça upload de uma imagem para o evento</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={imageUrl || ""} // Passa o valor atual da imagem
              onChange={handleImageChange} // Passa a função de callback
              folder="events"
              className="w-full aspect-video object-cover rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
            <CardDescription>Preencha os dados do evento</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name" // Renomeado para name
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_type" // Campo para tipo de evento
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Feira de Adoção, Campanha de Vacinação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço do evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date_ui" // Renomeado para start_date_ui
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_time_ui" // Renomeado para start_time_ui
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o evento, seus objetivos e público-alvo"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar Evento
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
