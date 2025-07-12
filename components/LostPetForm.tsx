"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "./ImageUpload"
import LocationSelector from "@/components/location-selector"
import { createLostPet } from "@/app/actions/pet-actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const lostPetSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().min(1, "Raça é obrigatória"),
  color: z.string().min(1, "Cor é obrigatória"),
  size: z.string().min(1, "Porte é obrigatória"),
  gender: z.string().min(1, "Sexo é obrigatória"),
  age: z.string().optional(),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  last_seen_location: z.string().min(1, "Local onde foi visto pela última vez é obrigatório"),
  last_seen_date: z.string().min(1, "Data é obrigatória"),
  contact_phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  contact_email: z.string().email("Email inválido").optional(),
  reward: z.string().optional(),
  special_needs: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatória"),
})

type LostPetFormData = z.infer<typeof lostPetSchema>

interface LostPetFormProps {
  onSuccess?: () => void
}

export function LostPetForm({ onSuccess }: LostPetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LostPetFormData>({
    resolver: zodResolver(lostPetSchema),
  })

  const watchedSpecies = watch("species")

  const handleLocationChange = (city: string, state: string) => {
    setValue("city", city)
    setValue("state", state)
  }

  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images)
  }

  const onSubmit = async (data: LostPetFormData) => {
    if (isSubmitting || isRedirecting) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate required fields
      if (!data.name || !data.species || !data.city || !data.state) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      // Create form data for server action
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      // Add images
      if (uploadedImages.length > 0) {
        formData.append("images", JSON.stringify(uploadedImages))
      }

      // Call server action
      const result = await createLostPet(formData)

      if (result.success) {
        toast.success("Pet perdido cadastrado com sucesso!")

        // Reset form
        reset()
        setUploadedImages([])

        // Handle redirect
        if (onSuccess) {
          onSuccess()
        } else {
          setIsRedirecting(true)
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1000)
        }
      } else {
        throw new Error(result.error || "Erro ao cadastrar pet")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitError(error instanceof Error ? error.message : "Erro inesperado")
      toast.error("Erro ao cadastrar pet. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cadastrar Pet Perdido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Pet *</Label>
              <Input id="name" {...register("name")} placeholder="Nome do seu pet" />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="species">Espécie *</Label>
              <Select onValueChange={(value) => setValue("species", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="bird">Pássaro</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.species && <p className="text-sm text-red-500 mt-1">{errors.species.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="breed">Raça *</Label>
              <Input id="breed" {...register("breed")} placeholder="Raça do pet" />
              {errors.breed && <p className="text-sm text-red-500 mt-1">{errors.breed.message}</p>}
            </div>

            <div>
              <Label htmlFor="color">Cor *</Label>
              <Input id="color" {...register("color")} placeholder="Cor predominante" />
              {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="size">Porte *</Label>
              <Select onValueChange={(value) => setValue("size", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
              {errors.size && <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Sexo *</Label>
              <Select onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Fêmea</SelectItem>
                  <SelectItem value="unknown">Não sei</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>}
            </div>

            <div>
              <Label htmlFor="age">Idade</Label>
              <Input id="age" {...register("age")} placeholder="Ex: 2 anos" />
            </div>
          </div>

          <div>
            <Label>Localização *</Label>
            <LocationSelector onLocationChange={handleLocationChange} required />
            {(errors.city || errors.state) && (
              <p className="text-sm text-red-500 mt-1">Cidade e estado são obrigatórios</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="last_seen_location">Local onde foi visto pela última vez *</Label>
              <Input
                id="last_seen_location"
                {...register("last_seen_location")}
                placeholder="Rua, bairro, ponto de referência"
              />
              {errors.last_seen_location && (
                <p className="text-sm text-red-500 mt-1">{errors.last_seen_location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_seen_date">Data que foi visto pela última vez *</Label>
              <Input id="last_seen_date" type="date" {...register("last_seen_date")} />
              {errors.last_seen_date && <p className="text-sm text-red-500 mt-1">{errors.last_seen_date.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva características marcantes, comportamento, etc."
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="special_needs">Necessidades Especiais</Label>
            <Textarea
              id="special_needs"
              {...register("special_needs")}
              placeholder="Medicamentos, cuidados especiais, etc."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_phone">Telefone para contato *</Label>
              <Input id="contact_phone" {...register("contact_phone")} placeholder="(11) 99999-9999" />
              {errors.contact_phone && <p className="text-sm text-red-500 mt-1">{errors.contact_phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="contact_email">Email para contato</Label>
              <Input id="contact_email" type="email" {...register("contact_email")} placeholder="seu@email.com" />
              {errors.contact_email && <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="reward">Recompensa</Label>
            <Input id="reward" {...register("reward")} placeholder="Valor da recompensa (opcional)" />
          </div>

          <div>
            <Label>Fotos do Pet</Label>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={5} existingImages={uploadedImages} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Pet Perdido"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default LostPetForm
