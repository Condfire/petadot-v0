"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ImageUpload from "./image-upload"
import SimpleStateCitySelector from "@/components/simple-state-city-selector"
import OtherOptionField from "@/components/other-option-field"
import { createLostPet } from "@/app/actions/pet-actions"

interface LostPetData {
  id?: string
  name?: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  gender: string
  gender_other?: string
  size: string
  size_other?: string
  color: string
  color_other?: string
  description?: string
  last_seen_date: string
  last_seen_location: string
  contact: string
  image_url: string
  is_special_needs: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  is_vaccinated?: boolean
  is_neutered?: boolean
  status?: string
  user_id?: string
  state?: string
  city?: string
}

interface LostPetFormProps {
  initialData?: LostPetData
  isEditing?: boolean
}

const defaultLostPetData: LostPetData = {
  name: "",
  species: "dog",
  breed: "",
  age: "",
  gender: "male",
  size: "medium",
  color: "black",
  description: "",
  last_seen_date: new Date().toISOString().split("T")[0],
  last_seen_location: "",
  contact: "",
  image_url: "",
  is_special_needs: false,
  special_needs_description: "",
  good_with_kids: false,
  good_with_cats: false,
  good_with_dogs: false,
  is_vaccinated: false,
  is_neutered: false,
  status: "pending",
  state: "",
  city: "",
}

// Exportação nomeada
export function LostPetForm({ initialData, isEditing = false }: LostPetFormProps) {
  const [petData, setPetData] = useState<LostPetData>(initialData || defaultLostPetData)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(initialData?.is_special_needs || false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (initialData) {
      setPetData(initialData)
      setImageUrl(initialData.image_url)
      setIsSpecialNeeds(initialData.is_special_needs)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário digita
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPetData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPetData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário seleciona
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleStateChange = (state: string) => {
    setPetData((prev) => ({ ...prev, state }))

    if (formErrors.state) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.state
        return newErrors
      })
    }
  }

  const handleCityChange = (city: string) => {
    setPetData((prev) => ({ ...prev, city }))

    if (formErrors.city) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.city
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!petData.species) errors.species = "Espécie é obrigatória"
    if (petData.species === "other" && !petData.species_other) errors.species_other = "Especifique a espécie"

    if (!petData.size) errors.size = "Porte é obrigatório"
    if (petData.size === "other" && !petData.size_other) errors.size_other = "Especifique o porte"

    if (!petData.gender) errors.gender = "Gênero é obrigatório"
    if (petData.gender === "other" && !petData.gender_other) errors.gender_other = "Especifique o gênero"

    if (!petData.color) errors.color = "Cor é obrigatória"
    if (petData.color === "other" && !petData.color_other) errors.color_other = "Especifique a cor"

    if (!petData.last_seen_date) errors.last_seen_date = "Data em que foi visto pela última vez é obrigatória"
    if (!petData.last_seen_location) errors.last_seen_location = "Local onde foi visto pela última vez é obrigatório"
    if (!petData.contact) errors.contact = "Contato para informações é obrigatório"
    if (!imageUrl) errors.image_url = "Imagem do pet é obrigatória"

    if (isSpecialNeeds && !petData.special_needs_description) {
      errors.special_needs_description = "Descrição das necessidades especiais é obrigatória"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulário
    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Preparar FormData para a Server Action
      const formData = new FormData()

      // Adicionar todos os campos do formulário
      formData.append("name", petData.name || "")
      formData.append("species", petData.species)
      if (petData.species_other) formData.append("species_other", petData.species_other)
      formData.append("breed", petData.breed || "")
      formData.append("age", petData.age || "")
      formData.append("size", petData.size)
      if (petData.size_other) formData.append("size_other", petData.size_other)
      formData.append("gender", petData.gender)
      if (petData.gender_other) formData.append("gender_other", petData.gender_other)
      formData.append("color", petData.color)
      if (petData.color_other) formData.append("color_other", petData.color_other)
      formData.append("description", petData.description || "")
      formData.append("last_seen_date", petData.last_seen_date)
      formData.append("last_seen_location", petData.last_seen_location)
      formData.append("contact", petData.contact)
      formData.append("image_url", imageUrl)
      formData.append("state", petData.state || "")
      formData.append("city", petData.city || "")

      // Campos booleanos
      if (isSpecialNeeds) {
        formData.append("is_special_needs", "on")
        if (petData.special_needs_description) {
          formData.append("special_needs_description", petData.special_needs_description)
        }
      }
      if (petData.good_with_kids) formData.append("good_with_kids", "on")
      if (petData.good_with_cats) formData.append("good_with_cats", "on")
      if (petData.good_with_dogs) formData.append("good_with_dogs", "on")
      if (petData.is_vaccinated) formData.append("is_vaccinated", "on")
      if (petData.is_neutered) formData.append("is_neutered", "on")

      console.log("Enviando dados para Server Action...")

      // Chamar a Server Action
      const result = await createLostPet(formData)

      if (result.success) {
        setSubmitSuccess(true)

        toast({
          title: "Pet reportado",
          description: "O pet perdido foi reportado com sucesso!",
        })

        // Aguardar 2 segundos antes de redirecionar
        setTimeout(() => {
          router.push("/dashboard/pets")
          router.refresh()
        }, 2000)
      } else {
        throw new Error(result.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("Erro ao salvar pet perdido:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pet perdido. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Pet reportado com sucesso! Você será redirecionado em instantes...
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Pet (opcional)</Label>
          <Input id="name" name="name" value={petData.name || ""} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="species" className="flex">
              Espécie<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="species"
              value={petData.species}
              onValueChange={(value) => handleSelectChange("species", value)}
              required
            >
              <SelectTrigger className={formErrors.species ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="bird">Pássaro</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.species && <p className="text-red-500 text-sm mt-1">{formErrors.species}</p>}

            <OtherOptionField
              isOtherSelected={petData.species === "other"}
              value={petData.species_other || ""}
              onChange={(value) => handleSelectChange("species_other", value)}
              label="Qual espécie?"
              required
            />
            {formErrors.species_other && <p className="text-red-500 text-sm mt-1">{formErrors.species_other}</p>}
          </div>

          <div>
            <Label htmlFor="breed">Raça (opcional)</Label>
            <Input id="breed" name="breed" value={petData.breed || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="age">Idade (opcional)</Label>
            <Input id="age" name="age" value={petData.age || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="size" className="flex">
              Porte<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="size"
              value={petData.size}
              onValueChange={(value) => handleSelectChange("size", value)}
              required
            >
              <SelectTrigger className={formErrors.size ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.size && <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>}

            <OtherOptionField
              isOtherSelected={petData.size === "other"}
              value={petData.size_other || ""}
              onChange={(value) => handleSelectChange("size_other", value)}
              label="Qual porte?"
              required
            />
            {formErrors.size_other && <p className="text-red-500 text-sm mt-1">{formErrors.size_other}</p>}
          </div>

          <div>
            <Label htmlFor="color" className="flex">
              Cor<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="color"
              value={petData.color}
              onValueChange={(value) => handleSelectChange("color", value)}
              required
            >
              <SelectTrigger className={formErrors.color ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Preto</SelectItem>
                <SelectItem value="white">Branco</SelectItem>
                <SelectItem value="brown">Marrom</SelectItem>
                <SelectItem value="gray">Cinza</SelectItem>
                <SelectItem value="golden">Dourado</SelectItem>
                <SelectItem value="spotted">Malhado</SelectItem>
                <SelectItem value="tricolor">Tricolor</SelectItem>
                <SelectItem value="other">Outra</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}

            <OtherOptionField
              isOtherSelected={petData.color === "other"}
              value={petData.color_other || ""}
              onChange={(value) => handleSelectChange("color_other", value)}
              label="Qual cor?"
              required
            />
            {formErrors.color_other && <p className="text-red-500 text-sm mt-1">{formErrors.color_other}</p>}
          </div>
        </div>

        <div>
          <Label className="flex">
            Gênero<span className="text-red-500 ml-1">*</span>
          </Label>
          <RadioGroup
            value={petData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
            className="flex gap-4 mt-2"
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" className={formErrors.gender ? "border-red-500" : ""} />
              <Label htmlFor="male" className="cursor-pointer">
                Macho
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" className={formErrors.gender ? "border-red-500" : ""} />
              <Label htmlFor="female" className="cursor-pointer">
                Fêmea
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="gender-other" className={formErrors.gender ? "border-red-500" : ""} />
              <Label htmlFor="gender-other" className="cursor-pointer">
                Outro
              </Label>
            </div>
          </RadioGroup>
          {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}

          <OtherOptionField
            isOtherSelected={petData.gender === "other"}
            value={petData.gender_other || ""}
            onChange={(value) => handleSelectChange("gender_other", value)}
            label="Qual gênero?"
            required
          />
          {formErrors.gender_other && <p className="text-red-500 text-sm mt-1">{formErrors.gender_other}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vaccinated"
              checked={petData.is_vaccinated}
              onCheckedChange={(checked) => handleCheckboxChange("is_vaccinated", checked === true)}
            />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Vacinado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_neutered"
              checked={petData.is_neutered}
              onCheckedChange={(checked) => handleCheckboxChange("is_neutered", checked === true)}
            />
            <Label htmlFor="is_neutered" className="cursor-pointer">
              Castrado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_special_needs"
              checked={isSpecialNeeds}
              onCheckedChange={(checked) => setIsSpecialNeeds(checked === true)}
            />
            <Label htmlFor="is_special_needs" className="cursor-pointer">
              Necessidades Especiais
            </Label>
          </div>
        </div>

        {isSpecialNeeds && (
          <div>
            <Label htmlFor="special_needs_description" className="flex">
              Descreva as necessidades especiais<span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="special_needs_description"
              name="special_needs_description"
              value={petData.special_needs_description || ""}
              onChange={handleChange}
              rows={2}
              required={isSpecialNeeds}
              className={formErrors.special_needs_description ? "border-red-500" : ""}
            />
            {formErrors.special_needs_description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.special_needs_description}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="good_with_kids"
              checked={petData.good_with_kids}
              onCheckedChange={(checked) => handleCheckboxChange("good_with_kids", checked === true)}
            />
            <Label htmlFor="good_with_kids" className="cursor-pointer">
              Bom com crianças
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="good_with_cats"
              checked={petData.good_with_cats}
              onCheckedChange={(checked) => handleCheckboxChange("good_with_cats", checked === true)}
            />
            <Label htmlFor="good_with_cats" className="cursor-pointer">
              Bom com gatos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="good_with_dogs"
              checked={petData.good_with_dogs}
              onCheckedChange={(checked) => handleCheckboxChange("good_with_dogs", checked === true)}
            />
            <Label htmlFor="good_with_dogs" className="cursor-pointer">
              Bom com cães
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            name="description"
            value={petData.description || ""}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="last_seen_date" className="flex">
              Data em que foi visto pela última vez<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="last_seen_date"
              name="last_seen_date"
              type="date"
              value={petData.last_seen_date}
              onChange={handleChange}
              required
              className={formErrors.last_seen_date ? "border-red-500" : ""}
            />
            {formErrors.last_seen_date && <p className="text-red-500 text-sm mt-1">{formErrors.last_seen_date}</p>}
          </div>

          <div>
            <Label htmlFor="last_seen_location" className="flex">
              Local onde foi visto pela última vez<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="last_seen_location"
              name="last_seen_location"
              value={petData.last_seen_location}
              onChange={handleChange}
              required
              className={formErrors.last_seen_location ? "border-red-500" : ""}
            />
            {formErrors.last_seen_location && (
              <p className="text-red-500 text-sm mt-1">{formErrors.last_seen_location}</p>
            )}
          </div>
        </div>

        <SimpleStateCitySelector
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          required={false}
          initialState={petData.state}
          initialCity={petData.city}
        />

        <div>
          <Label htmlFor="contact" className="flex">
            Contato para informações<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="contact"
            name="contact"
            value={petData.contact}
            onChange={handleChange}
            required
            className={formErrors.contact ? "border-red-500" : ""}
            placeholder="Telefone, WhatsApp ou e-mail"
          />
          {formErrors.contact && <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>}
        </div>

        <div>
          <Label className="flex">
            Foto do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} required folder="pets_lost" />
          {formErrors.image_url && <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Atualizar Pet" : "Reportar Pet Perdido"}
        </Button>
      </div>
    </form>
  )
}

// Exportação padrão
export default LostPetForm
