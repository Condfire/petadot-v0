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

const lostPetSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().min(1, "Raça é obrigatória"),
  color: z.string().min(1, "Cor é obrigatória"),
  size: z.string().min(1, "Porte é obrigatório"),
  gender: z.string().min(1, "Sexo é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  contact_whatsapp: z.string().min(10, "WhatsApp é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatória"),
  special_needs: z.string().optional(),
  last_seen_location: z.string().optional(),
  reward_offered: z.boolean().optional(),
  reward_amount: z.string().optional(),
})

type LostPetFormData = z.infer<typeof lostPetSchema>

interface LostPetFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function LostPetForm({ onSuccess, onError }: LostPetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

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
  const watchedState = watch("state")
  const watchedCity = watch("city")

  const handleLocationChange = (state: string, city: string) => {
    setValue("state", state)
    setValue("city", city)
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
      if (!data.name || !data.species || !data.breed || !data.city || !data.state) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      if (uploadedImages.length === 0) {
        throw new Error("Por favor, adicione pelo menos uma foto do pet")
      }

      // Prepare form data
      const formData = new FormData()

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Add images
      uploadedImages.forEach((imageUrl, index) => {
        formData.append(`image_${index}`, imageUrl)
      })
      formData.append("images_count", String(uploadedImages.length))

      // Submit to server action
      const result = await createLostPet(formData)

      if (result.success) {
        // Success - redirect to dashboard
        setIsRedirecting(true)
        onSuccess?.()

        // Use window.location for reliable redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        throw new Error(result.error || "Erro ao cadastrar pet perdido")
      }
    } catch (error) {
      console.error("Error submitting lost pet form:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao cadastrar pet"
      setSubmitError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRedirecting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Pet cadastrado com sucesso! Redirecionando...</p>
          </div>
        </CardContent>
      </Card>
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

          {/* Pet Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pet *</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Rex, Mimi, etc." />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Species */}
          <div className="space-y-2">
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
            {errors.species && <p className="text-sm text-red-500">{errors.species.message}</p>}
          </div>

          {/* Breed */}
          <div className="space-y-2">
            <Label htmlFor="breed">Raça *</Label>
            <Input id="breed" {...register("breed")} placeholder="Ex: Vira-lata, Siamês, etc." />
            {errors.breed && <p className="text-sm text-red-500">{errors.breed.message}</p>}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Cor *</Label>
            <Input id="color" {...register("color")} placeholder="Ex: Marrom, Preto e branco, etc." />
            {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="size">Porte *</Label>
            <Select onValueChange={(value) => setValue("size", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
            {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo *</Label>
            <Select onValueChange={(value) => setValue("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Macho</SelectItem>
                <SelectItem value="female">Fêmea</SelectItem>
                <SelectItem value="unknown">Não sei</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Localização *</Label>
            <LocationSelector
              selectedState={watchedState}
              selectedCity={watchedCity}
              onLocationChange={handleLocationChange}
            />
            {(errors.state || errors.city) && (
              <p className="text-sm text-red-500">{errors.state?.message || errors.city?.message}</p>
            )}
          </div>

          {/* Last Seen Location */}
          <div className="space-y-2">
            <Label htmlFor="last_seen_location">Local onde foi visto pela última vez</Label>
            <Input
              id="last_seen_location"
              {...register("last_seen_location")}
              placeholder="Ex: Praça da Liberdade, próximo ao shopping, etc."
            />
          </div>

          {/* Special Needs */}
          <div className="space-y-2">
            <Label htmlFor="special_needs">Necessidades Especiais</Label>
            <Textarea
              id="special_needs"
              {...register("special_needs")}
              placeholder="Ex: Toma medicação, tem alguma deficiência, etc."
              rows={3}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva características marcantes, comportamento, etc."
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Contact WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="contact_whatsapp">WhatsApp para Contato *</Label>
            <Input id="contact_whatsapp" {...register("contact_whatsapp")} placeholder="(11) 99999-9999" />
            {errors.contact_whatsapp && <p className="text-sm text-red-500">{errors.contact_whatsapp.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Fotos do Pet *</Label>
            <ImageUpload onImagesChange={handleImagesChange} maxImages={5} existingImages={uploadedImages} />
            {uploadedImages.length === 0 && <p className="text-sm text-red-500">Adicione pelo menos uma foto</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || isRedirecting}>
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
