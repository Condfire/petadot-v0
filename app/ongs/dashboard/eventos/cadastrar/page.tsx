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
import { ImageUpload } from "@/components/image-upload"
import { createEvent } from "@/app/actions/event-actions" // Use the server action

// Schema de validação para o formulário de eventos
const eventFormSchema = z.object({
  name: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
  location: z.string().min(5, { message: "Informe o local do evento." }),
  event_date: z.string().min(1, { message: "Selecione a data do evento." }),
  event_time: z.string().min(1, { message: "Informe o horário do evento." }),
  image_url: z.string().url({ message: "Por favor, faça o upload de uma imagem válida." }).optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function CadastrarEventoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      event_date: "",
      event_time: "",
      image_url: "",
    },
  })

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time into a single ISO string for the 'date' field
      const eventDateTime = new Date(`${data.event_date}T${data.event_time}`)
      if (isNaN(eventDateTime.getTime())) {
        throw new Error("Data ou horário inválido.")
      }

      const eventData = {
        name: data.name,
        description: data.description,
        location: data.location,
        date: eventDateTime.toISOString(), // This is the field the server action expects
        image_url: data.image_url,
      }

      const result = await createEvent(eventData)

      if (!result.success) {
        throw new Error(result.error || "Ocorreu um erro desconhecido.")
      }

      router.push("/ongs/dashboard?success=Evento cadastrado com sucesso e aguardando aprovação.")
    } catch (err: any) {
      console.error("Erro ao cadastrar evento:", err)
      setError(err.message || "Ocorreu um erro ao cadastrar o evento. Verifique os campos e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    form.setValue("image_url", url, { shouldValidate: true })
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Imagem do Evento</CardTitle>
                  <CardDescription>Faça upload de uma imagem para o evento.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            onImageUploaded={handleImageUpload}
                            value={field.value}
                            folder="events"
                            className="w-full aspect-video object-cover rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Evento</CardTitle>
                  <CardDescription>Preencha os dados do evento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Feira de Adoção PetFeliz" {...field} />
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
                          <Input placeholder="Endereço completo do evento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="event_date"
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
                      name="event_time"
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
                            placeholder="Descreva o evento, seus objetivos, atrações e público-alvo."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Cadastrando..." : "Cadastrar Evento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
