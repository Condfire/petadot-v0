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
import { ImageUpload } from "@/components/ImageUpload"
import { LocationSelector } from "@/components/location-selector"
import { createFoundPet } from "@/app/actions/found-pet-actions"
import { Loader2 } from "lucide-react"

const foundPetSchema = z.object({
  name: z.string().optional(),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().min(1, "Raça é obrigatória"),
  color: z.string().min(1, "Cor é obrigatória"),
  size: z.string().min(1, "Porte é obrigatório"),
  gender: z.string().min(1, "Sexo é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  contact_whatsapp: z.string().min(10, "WhatsApp é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatória"),
  found_location: z.string().min(1, "Local onde foi encontrado é obrigatório"),
  found_date: z.string().min(1, "Data que foi encontrado é obrigatória"),
  current_location: z.string().optional(),
  special_needs: z.string().optional(),
})

type FoundPetFormData = z.infer<typeof foundPetSchema>

interface FoundPetFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function FoundPetForm({ onSuccess, onError }: FoundPetFormProps) {
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
  } = useForm<FoundPetFormData>({
    resolver: zodResolver(foundPetSchema),
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

  const onSubmit = async (data: FoundPetFormData) => {
    if (isSubmitting || isRedirecting) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate required fields
      if (!data.species || !data.breed || !data.city || !data.state || !data.found_location) {
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
      const result = await createFoundPet(formData)

      if (result.success) {
        // Success - redirect to dashboard
        setIsRedirecting(true)
        onSuccess?.()

        // Use window.location for reliable redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        throw new Error(result.error || "Erro ao cadastrar pet encontrado")
      }
    } catch (error) {
      console.error("Error submitting found pet form:", error)
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
        <CardTitle>Cadastrar Pet Encontrado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Pet Name (Optional for found pets) */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Pet (se souber)</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Rex, Mimi, etc." />
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

          {/* Found Location */}
          <div className="space-y-2">
            <Label htmlFor="found_location">Local onde foi encontrado *</Label>
            <Input
              id="found_location"
              {...register("found_location")}
              placeholder="Ex: Praça da Liberdade, próximo ao shopping, etc."
            />
            {errors.found_location && <p className="text-sm text-red-500">{errors.found_location.message}</p>}
          </div>

          {/* Found Date */}
          <div className="space-y-2">
            <Label htmlFor="found_date">Data que foi encontrado *</Label>
            <Input id="found_date" type="date" {...register("found_date")} />
            {errors.found_date && <p className="text-sm text-red-500">{errors.found_date.message}</p>}
          </div>

          {/* Current Location */}
          <div className="space-y-2">
            <Label htmlFor="current_location">Onde está agora</Label>
            <Input
              id="current_location"
              {...register("current_location")}
              placeholder="Ex: Na minha casa, no veterinário, etc."
            />
          </div>

          {/* Special Needs */}
          <div className="space-y-2">
            <Label htmlFor="special_needs">Necessidades Especiais</Label>
            <Textarea
              id="special_needs"
              {...register("special_needs")}
              placeholder="Ex: Precisa de medicação, tem alguma deficiência, etc."
              rows={3}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva características marcantes, comportamento, estado de saúde, etc."
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
              "Cadastrar Pet Encontrado"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default FoundPetForm
