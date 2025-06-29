"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { createAdoptionPet, type PetFormData } from "@/lib/client-pet-actions"
import { useAuth } from "@/app/auth-provider"

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

export function AdoptionPetForm() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    color: "",
    size: "",
    gender: "",
    age: "",
    description: "",
    city: "",
    state: "",
    contact_whatsapp: "",
    contact_email: "",
    special_needs: "",
    good_with_kids: false,
    good_with_dogs: false,
    good_with_cats: false,
    vaccinated: false,
    neutered: false,
  })

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login?returnUrl=" + encodeURIComponent("/cadastrar-pet-adocao"))
    return null
  }

  const handleInputChange = (field: keyof PetFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 images
    const selectedFiles = files.slice(0, 5)
    setImages(selectedFiles)

    // Create previews
    const previews = selectedFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])

    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Você precisa estar logado para cadastrar um pet")
      router.push("/login")
      return
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.species ||
      !formData.breed ||
      !formData.city ||
      !formData.state ||
      !formData.contact_whatsapp
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const result = await createAdoptionPet({
        ...formData,
        images,
      })

      if (result.success) {
        toast.success("Pet cadastrado com sucesso!")
        router.push("/dashboard")
      } else {
        toast.error(result.error || "Erro ao cadastrar pet")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Erro ao cadastrar pet")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cadastrar Pet para Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Pet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="species">Espécie *</Label>
              <Select value={formData.species} onValueChange={(value) => handleInputChange("species", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="breed">Raça *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Cor *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="size">Porte *</Label>
              <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">Sexo *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Ex: 2 anos, 6 meses"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o temperamento, características especiais, etc."
              required
            />
          </div>

          {/* Special Needs */}
          <div>
            <Label htmlFor="special_needs">Necessidades Especiais</Label>
            <Textarea
              id="special_needs"
              value={formData.special_needs}
              onChange={(e) => handleInputChange("special_needs", e.target.value)}
              placeholder="Medicamentos, cuidados especiais, etc."
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_whatsapp">WhatsApp *</Label>
              <Input
                id="contact_whatsapp"
                value={formData.contact_whatsapp}
                onChange={(e) => handleInputChange("contact_whatsapp", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Characteristics */}
          <div className="space-y-4">
            <Label>Características</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_kids"
                  checked={formData.good_with_kids}
                  onCheckedChange={(checked) => handleInputChange("good_with_kids", checked as boolean)}
                />
                <Label htmlFor="good_with_kids">Bom com crianças</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_dogs"
                  checked={formData.good_with_dogs}
                  onCheckedChange={(checked) => handleInputChange("good_with_dogs", checked as boolean)}
                />
                <Label htmlFor="good_with_dogs">Bom com cães</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="good_with_cats"
                  checked={formData.good_with_cats}
                  onCheckedChange={(checked) => handleInputChange("good_with_cats", checked as boolean)}
                />
                <Label htmlFor="good_with_cats">Bom com gatos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccinated"
                  checked={formData.vaccinated}
                  onCheckedChange={(checked) => handleInputChange("vaccinated", checked as boolean)}
                />
                <Label htmlFor="vaccinated">Vacinado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="neutered"
                  checked={formData.neutered}
                  onCheckedChange={(checked) => handleInputChange("neutered", checked as boolean)}
                />
                <Label htmlFor="neutered">Castrado</Label>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="images">Fotos do Pet (máximo 5)</Label>
            <div className="mt-2">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Fotos
              </Button>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Pet"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AdoptionPetForm
