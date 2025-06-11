"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import { createEvent } from "@/app/actions/event-actions"
import { mapEventUIToDB, type EventFormUI } from "@/lib/mappers"

// Esquema de validação
const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  start_date_ui: z.string().min(1, { message: "A data de início é obrigatória" }),
  start_time_ui: z.string().min(1, { message: "O horário de início é obrigatório" }),
  end_date_ui: z.string().optional(),
  location: z.string().min(5, { message: "O local é obrigatório" }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  image_url: z.string().min(1, { message: "Uma imagem é obrigatória" }),
  // Adicione outros campos do evento aqui, se necessário, como event_type, contact_email, etc.
  // Para simplificar, vamos adicionar apenas os campos essenciais para o erro atual.
  // event_type: z.string().optional(),
  // contact_email: z.string().email().optional().or(z.literal("")),
  // contact_phone: z.string().optional(),
  // registration_url: z.string().url().optional().or(z.literal("")),
  // registration_required: z.boolean().optional(),
  // max_participants: z.number().int().min(1).optional(),
  // is_featured: z.boolean().optional(),
})

export default function CadastrarEvento() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date_ui: new Date().toISOString().split("T")[0], // Default to today
      start_time_ui: "09:00", // Default time
      end_date_ui: "",
      location: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      image_url: "",
      // Default values for new fields if added to schema
      // event_type: "other",
      // contact_email: "",
      // contact_phone: "",
      // registration_url: "",
      // registration_required: false,
      // max_participants: undefined,
      // is_featured: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus(null)

    console.log("Valores do formulário antes do mapeamento:", values)

    try {
      // Map UI form data to DB format
      const eventDBData = mapEventUIToDB(values as EventFormUI)

      console.log("Dados do evento após mapeamento para DB:", eventDBData)

      const result = await createEvent(eventDBData)

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: "Evento cadastrado com sucesso! Após aprovação, ele aparecerá na lista de eventos.",
        })
        // Resetar o formulário após envio bem-sucedido
        form.reset({
          name: "",
          description: "",
          start_date_ui: new Date().toISOString().split("T")[0],
          start_time_ui: "09:00",
          end_date_ui: "",
          location: "",
          address: "",
          city: "",
          state: "",
          postal_code: "",
          image_url: "",
          // Reset new fields if added to schema
          // event_type: "other",
          // contact_email: "",
          // contact_phone: "",
          // registration_url: "",
          // registration_required: false,
          // max_participants: undefined,
          // is_featured: false,
        })
      } else {
        setSubmitStatus({
          success: false,
          message: result.error || "Ocorreu um erro ao cadastrar o evento. Tente novamente.",
        })
      }
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Ocorreu um erro ao cadastrar o evento. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cadastrar Evento</h1>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo com as informações do evento relacionado a pets.
          </p>
        </div>

        {submitStatus && (
          <Alert className={submitStatus.success ? "bg-primary/20 mb-6" : "bg-destructive/20 mb-6"}>
            {submitStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <AlertTitle>{submitStatus.success ? "Sucesso!" : "Erro!"}</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações do Evento</CardTitle>
            <CardDescription>
              Forneça informações detalhadas sobre o evento para atrair mais participantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Feira de Adoção, Campanha de Vacinação, etc." {...field} />
                      </FormControl>
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
                          placeholder="Descreva o evento, seus objetivos, público-alvo, etc."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date_ui"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início do Evento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_time_ui"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Início do Evento</FormLabel>
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
                  name="end_date_ui"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Preencha apenas se o evento durar mais de um dia.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Praça Central, Shopping Center, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rua, número, bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem do Evento (URL)</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value} onChange={field.onChange} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>Adicione uma URL de imagem atrativa relacionada ao evento.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Cadastrar Evento"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
