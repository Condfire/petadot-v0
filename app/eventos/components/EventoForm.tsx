"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ImageUpload"
import { useToast } from "@/components/ui/use-toast"
import { createEvent, updateEvent } from "@/app/actions/event-actions"
import { mapEventDBToUI, mapEventUIToDB } from "@/lib/mappers"
import type { EventFormUI, EventDB } from "@/lib/types" // Importar tipos do lib/types

const EventoFormSchema = z.object({
  name: z.string().min(2, { message: "O nome do evento deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  start_date_ui: z.string().min(1, { message: "A data de início é obrigatória." }),
  start_time_ui: z.string().min(1, { message: "O horário de início é obrigatório." }),
  end_date_ui: z.string().optional(),
  location: z.string().min(2, { message: "A localização é obrigatória." }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  image_url: z.string().optional(),
  contact_email: z.string().email({ message: "E-mail de contato inválido." }).optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  event_type: z.string().min(1, { message: "O tipo de evento é obrigatório." }),
  registration_url: z.string().url({ message: "URL de registro inválida." }).optional().or(z.literal("")),
  registration_required: z.boolean().default(false),
  max_participants: z.coerce.number().int().min(0).optional(),
  is_featured: z.boolean().default(false),
})

interface EventoFormProps {
  initialData?: EventDB // Dados do evento para edição
  ongId?: string // ID da ONG, se aplicável
  userId?: string // ID do usuário, se aplicável
}

export default function EventoForm({ initialData, ongId, userId }: EventoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const defaultValues: EventFormUI = initialData
    ? mapEventDBToUI(initialData)
    : {
        name: "",
        description: "",
        start_date_ui: "",
        start_time_ui: "",
        end_date_ui: "",
        location: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        image_url: "",
        contact_email: "",
        contact_phone: "",
        event_type: "adoption_fair",
        registration_url: "",
        registration_required: false,
        max_participants: undefined,
        is_featured: false,
      }

  const form = useForm<EventFormUI>({
    resolver: zodResolver(EventoFormSchema),
    defaultValues,
  })

  const onSubmit = async (values: EventFormUI) => {
    setLoading(true)
    try {
      console.log("Valores do formulário antes do mapeamento:", values)
      const eventDBData = mapEventUIToDB(values, ongId, userId)

      let result
      if (initialData) {
        result = await updateEvent(initialData.id, eventDBData)
      } else {
        result = await createEvent(eventDBData)
      }

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Evento ${initialData ? "atualizado" : "cadastrado"} com sucesso.`,
        })
        router.push("/ongs/dashboard/eventos") // Redirecionar para a lista de eventos
        router.refresh()
      } else {
        toast({
          title: "Erro",
          description: result.error || `Falha ao ${initialData ? "atualizar" : "cadastrar"} evento.`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar/atualizar evento:", error)
      toast({
        title: "Erro crítico",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Evento</FormLabel>
              <FormControl>
                <Input placeholder="Feira de Adoção de Verão" {...field} />
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
                <Textarea placeholder="Detalhes sobre o evento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do Evento</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || ""}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date_ui"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
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
                <FormLabel>Horário de Início</FormLabel>
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
              <FormLabel>Data de Término (Opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
                <Input placeholder="Parque Municipal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua das Flores, 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
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
                <FormLabel>Estado (UF)</FormLabel>
                <FormControl>
                  <Input placeholder="SP" {...field} />
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
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="00000-000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="event_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Evento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="adoption_fair">Feira de Adoção</SelectItem>
                  <SelectItem value="fundraising">Arrecadação de Fundos</SelectItem>
                  <SelectItem value="vaccination">Campanha de Vacinação</SelectItem>
                  <SelectItem value="educational">Evento Educativo</SelectItem>
                  <SelectItem value="volunteer">Voluntariado</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail de Contato</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@ong.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de Contato (WhatsApp)</FormLabel>
              <FormControl>
                <Input placeholder="(XX) XXXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="registration_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Registro (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://link-de-registro.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="registration_required"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Registro Obrigatório</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Marque se os participantes precisam se registrar previamente.
                </p>
              </div>
            </FormItem>
          )}
        />
        {form.watch("registration_required") && (
          <FormField
            control={form.control}
            name="max_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Máximo de Participantes (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Evento em Destaque</FormLabel>
                <p className="text-sm text-muted-foreground">Marque para destacar este evento na página principal.</p>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : initialData ? "Atualizar Evento" : "Cadastrar Evento"}
        </Button>
      </form>
    </Form>
  )
}
