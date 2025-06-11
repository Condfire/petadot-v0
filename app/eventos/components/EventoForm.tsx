"use client"

import { FormDescription } from "@/components/ui/form"

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
import { mapEventUIToDB, mapEventDBToUI } from "@/lib/mappers"
import { createEvent, updateEvent } from "@/app/actions/event-actions"
import { Loader2 } from "lucide-react"

const eventFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres." }),
  description: z
    .string()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres." })
    .max(1000, { message: "A descrição deve ter no máximo 1000 caracteres." }),
  start_date_ui: z.string().min(1, { message: "A data de início é obrigatória." }),
  start_time_ui: z.string().min(1, { message: "O horário de início é obrigatório." }),
  end_date_ui: z.string().optional(),
  location: z
    .string()
    .min(2, { message: "A localização é obrigatória." })
    .max(255, { message: "A localização deve ter no máximo 255 caracteres." }),
  address: z.string().max(255, { message: "O endereço deve ter no máximo 255 caracteres." }).optional(),
  city: z.string().max(100, { message: "A cidade deve ter no máximo 100 caracteres." }).optional(),
  state: z.string().max(100, { message: "O estado deve ter no máximo 100 caracteres." }).optional(),
  postal_code: z.string().max(20, { message: "O CEP deve ter no máximo 20 caracteres." }).optional(),
  image_url: z.string().url({ message: "URL de imagem inválida." }).optional().or(z.literal("")),
  contact_email: z.string().email({ message: "E-mail de contato inválido." }).optional().or(z.literal("")),
  contact_phone: z
    .string()
    .max(50, { message: "O telefone de contato deve ter no máximo 50 caracteres." })
    .optional()
    .or(z.literal("")),
  event_type: z.string().min(1, { message: "O tipo de evento é obrigatório." }),
  registration_url: z.string().url({ message: "URL de registro inválida." }).optional().or(z.literal("")),
  registration_required: z.boolean().default(false).optional(),
  max_participants: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number()
      .int()
      .min(1, { message: "O número máximo de participantes deve ser pelo menos 1." })
      .optional()
      .nullable(),
  ),
  is_featured: z.boolean().default(false).optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventoFormProps {
  initialData?: any // Usar 'any' temporariamente ou definir um tipo mais específico
  ongId?: string
  userId?: string
}

export default function EventoForm({ initialData, ongId, userId }: EventoFormProps) {
  // Exportar como default export
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialData
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
          event_type: "other",
          registration_url: "",
          registration_required: false,
          max_participants: undefined,
          is_featured: false,
        },
  })

  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Valores do formulário antes do mapeamento:", values)
      const eventDBData = mapEventUIToDB(values, ongId, userId)
      console.log("Dados do evento para o DB:", eventDBData)

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
        router.push("/ongs/dashboard/eventos")
        router.refresh()
      } else {
        throw new Error(result.error || "Erro desconhecido ao salvar evento.")
      }
    } catch (error: any) {
      console.error("Erro ao salvar evento:", error)
      toast({
        title: "Erro ao salvar evento",
        description: error.message || "Ocorreu um erro ao salvar o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const eventTypes = [
    { value: "adoption_fair", label: "Feira de Adoção" },
    { value: "vaccination_campaign", label: "Campanha de Vacinação" },
    { value: "fundraising", label: "Arrecadação de Fundos" },
    { value: "workshop", label: "Workshop/Palestra" },
    { value: "volunteer_day", label: "Dia do Voluntário" },
    { value: "other", label: "Outro" },
  ]

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
                <Input placeholder="Ex: Feira de Adoção de Verão" {...field} />
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
                <Textarea placeholder="Detalhes sobre o evento..." rows={5} {...field} />
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
                <ImageUpload value={field.value || ""} onChange={(url) => field.onChange(url)} folder="event_images" />
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
              <FormLabel>Localização (Nome do Local)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Parque Ibirapuera" {...field} />
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
              <FormLabel>Endereço (Rua, Número)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Av. Pedro Álvares Cabral, s/n" {...field} />
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
                  <Input placeholder="Ex: São Paulo" {...field} />
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
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 04094-050" {...field} />
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
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
              <FormLabel>E-mail de Contato (Opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@evento.com" {...field} />
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
              <FormLabel>Telefone de Contato (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="(XX) XXXXX-XXXX" {...field} />
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
                <FormLabel>Inscrição Obrigatória</FormLabel>
                <FormDescription>Marque se os participantes precisam se inscrever previamente.</FormDescription>
              </div>
            </FormItem>
          )}
        />
        {form.watch("registration_required") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="registration_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Inscrição</FormLabel>
                  <FormControl>
                    <Input placeholder="https://link-de-inscricao.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Participantes (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                <FormDescription>Marque para destacar este evento na página principal.</FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Atualizar Evento" : "Cadastrar Evento"}
        </Button>
      </form>
    </Form>
  )
}
