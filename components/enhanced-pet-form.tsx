"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import { LocationSelector } from "@/components/location-selector"
import { petSchema, type PetFormInput } from "@/lib/validators/pet"
import { toast } from "sonner"

interface EnhancedPetFormProps {
  initialData?: Partial<PetFormInput>
  mode: "create" | "edit"
  onSubmit: (formData: FormData) => Promise<{ success: boolean; message: string; slug?: string }>
}

export function EnhancedPetForm({ initialData, mode, onSubmit }: EnhancedPetFormProps) {
  const [isPending, startTransition] = useTransition()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const form = useForm<PetFormInput>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: initialData?.name || "",
      species: initialData?.species || "dog",
      otherSpecies: initialData?.otherSpecies || "",
      breed: initialData?.breed || "mixed",
      otherBreed: initialData?.otherBreed || "",
      color: initialData?.color || "",
      size: initialData?.size || "medium",
      gender: initialData?.gender || "unknown",
      status: initialData?.status || "lost",
      description: initialData?.description || "",
      whatsappContact: initialData?.whatsappContact || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      images: [],
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (imageFiles.length + files.length > 5) {
      toast.error("Máximo de 5 imagens permitidas")
      return
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      toast.error("Algumas imagens foram rejeitadas. Apenas imagens até 5MB são aceitas.")
    }

    const newFiles = [...imageFiles, ...validFiles]
    setImageFiles(newFiles)
    form.setValue("images", newFiles, { shouldValidate: true })

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    form.setValue("images", newFiles, { shouldValidate: true })
  }

  const handleSubmit = async (data: PetFormInput) => {
    startTransition(async () => {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === "images") {
          // Handle images separately
          imageFiles.forEach((file) => {
            formData.append("images", file)
          })
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString())
        }
      })

      const result = await onSubmit(formData)

      if (result.success) {
        toast.success(result.message)
        if (mode === "create") {
          form.reset()
          setImageFiles([])
          setImagePreviews([])
        }
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{mode === "create" ? "Cadastrar Pet" : "Editar Pet"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Nome e WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pet *</Label>
              <Input id="name" {...form.register("name")} placeholder="Ex: Rex, Mimi, Bolinha" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappContact">WhatsApp para Contato *</Label>
              <Input id="whatsappContact" {...form.register("whatsappContact")} placeholder="(11) 99999-9999" />
              {form.formState.errors.whatsappContact && (
                <p className="text-sm text-red-600">{form.formState.errors.whatsappContact.message}</p>
              )}
            </div>
          </div>

          {/* Espécie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Espécie *</Label>
              <Select
                onValueChange={(value) => form.setValue("species", value, { shouldValidate: true })}
                value={form.watch("species")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.species && (
                <p className="text-sm text-red-600">{form.formState.errors.species.message}</p>
              )}
            </div>

            {form.watch("species") === "other" && (
              <div className="space-y-2">
                <Label htmlFor="otherSpecies">Qual outra espécie? *</Label>
                <Input id="otherSpecies" {...form.register("otherSpecies")} placeholder="Ex: Coelho, Hamster" />
                {form.formState.errors.otherSpecies && (
                  <p className="text-sm text-red-600">{form.formState.errors.otherSpecies.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Raça */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Raça *</Label>
              <Select
                onValueChange={(value) => form.setValue("breed", value, { shouldValidate: true })}
                value={form.watch("breed")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a raça" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">SRD (Sem Raça Definida)</SelectItem>
                  <SelectItem value="labrador">Labrador</SelectItem>
                  <SelectItem value="golden">Golden Retriever</SelectItem>
                  <SelectItem value="poodle">Poodle</SelectItem>
                  <SelectItem value="bulldog">Bulldog</SelectItem>
                  <SelectItem value="siamese">Siamês</SelectItem>
                  <SelectItem value="persian">Persa</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.breed && (
                <p className="text-sm text-red-600">{form.formState.errors.breed.message}</p>
              )}
            </div>

            {form.watch("breed") === "other" && (
              <div className="space-y-2">
                <Label htmlFor="otherBreed">Qual outra raça? *</Label>
                <Input id="otherBreed" {...form.register("otherBreed")} placeholder="Digite a raça" />
                {form.formState.errors.otherBreed && (
                  <p className="text-sm text-red-600">{form.formState.errors.otherBreed.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Cor, Porte e Gênero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor *</Label>
              <Input id="color" {...form.register("color")} placeholder="Ex: Caramelo, Preto, Branco" />
              {form.formState.errors.color && (
                <p className="text-sm text-red-600">{form.formState.errors.color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Porte *</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("size", value as "small" | "medium" | "large", { shouldValidate: true })
                }
                value={form.watch("size")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.size && (
                <p className="text-sm text-red-600">{form.formState.errors.size.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gênero *</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("gender", value as "male" | "female" | "unknown", { shouldValidate: true })
                }
                value={form.watch("gender")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Fêmea</SelectItem>
                  <SelectItem value="unknown">Desconhecido</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Descreva o pet, características, comportamento, onde foi visto pela última vez, etc."
              rows={5}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label>Localização *</Label>
            <LocationSelector
              onStateChange={(state) => form.setValue("state", state, { shouldValidate: true })}
              onCityChange={(city) => form.setValue("city", city, { shouldValidate: true })}
              initialState={form.watch("state")}
              initialCity={form.watch("city")}
            />
            {(form.formState.errors.state || form.formState.errors.city) && (
              <p className="text-sm text-red-600">
                {form.formState.errors.state?.message || form.formState.errors.city?.message}
              </p>
            )}
          </div>

          {/* Upload de Imagens */}
          <div className="space-y-4">
            <Label>Fotos do Pet * (1-5 imagens, máximo 5MB cada)</Label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Clique para selecionar imagens ou arraste e solte aqui</p>
                <p className="text-xs text-gray-500">PNG, JPG até 5MB cada</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {form.formState.errors.images && (
              <p className="text-sm text-red-600">{form.formState.errors.images.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Cadastrar Pet" : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
