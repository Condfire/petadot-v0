"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { ImageUpload } from "@/components/ImageUpload"
import { createAdoptionPet } from "@/app/actions/pet-actions"
import { SimpleLocationSelector } from "@/components/simple-location-selector"

interface AdoptionPetFormProps {
  ongId?: string // Modificado para opcional
  ongName?: string // Modificado para opcional
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function AdoptionPetForm({ ongId, ongName, onSuccess, onError }: AdoptionPetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    species_other: "",
    breed: "",
    age: "",
    gender: "",
    gender_other: "",
    size: "",
    size_other: "",
    color: "",
    color_other: "",
    description: "",
    image_url: "",
    is_vaccinated: false,
    is_neutered: false,
    special_needs: "",
    temperament: "",
    energy_level: "",
    sociability: "",
    shedding: "",
    trainability: "",
    location: "",
    city: "",
    state: "",
    contact: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário digita
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário seleciona
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleOtherOptionChange = (field: string, value: string) => {
    const fieldName = `${field}_other`
    setFormData((prev) => ({ ...prev, [fieldName]: value }))

    // Limpar erro do campo quando o usuário digita
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({ ...prev, state }))

    if (formErrors.state) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.state
        return newErrors
      })
    }
  }

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({ ...prev, city }))

    if (formErrors.city) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.city
        return newErrors
      })
    }
  }

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))

    if (formErrors.image_url) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.image_url
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!formData.name) errors.name = "Nome do pet é obrigatório"
    if (!formData.species) errors.species = "Espécie é obrigatória"
    if (formData.species === "other" && !formData.species_other) errors.species_other = "Especifique a espécie"

    if (!formData.breed) errors.breed = "Raça é obrigatória"
    if (!formData.age) errors.age = "Idade é obrigatória"

    if (!formData.gender) errors.gender = "Gênero é obrigatório"
    if (formData.gender === "other" && !formData.gender_other) errors.gender_other = "Especifique o gênero"

    if (!formData.size) errors.size = "Porte é obrigatório"
    if (formData.size === "other" && !formData.size_other) errors.size_other = "Especifique o porte"

    if (!formData.color) errors.color = "Cor é obrigatória"
    if (formData.color === "other" && !formData.color_other) errors.color_other = "Especifique a cor"

    if (!formData.description || formData.description.length < 10) {
      errors.description = "Descrição deve ter pelo menos 10 caracteres"
    }

    if (!formData.state) errors.state = "Estado é obrigatório"
    if (!formData.city) errors.city = "Cidade é obrigatória"
    if (!formData.contact) errors.contact = "Contato é obrigatório"
    if (!formData.image_url) errors.image_url = "Imagem do pet é obrigatória"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulário enviado", formData)

    // Validar formulário
    if (!validateForm()) {
      console.log("Formulário inválido", formErrors)
      onError?.("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)
    setSubmitSuccess(false) // Reset success state on new submission

    try {
      // Adicionar localização formatada
      const location = formData.city && formData.state ? `${formData.city}, ${formData.state}` : ""

      // Preparar dados para envio, substituindo valores "other" pelos valores personalizados
      const processedData = {
        ...formData,
        species: formData.species === "other" ? formData.species_other : formData.species,
        size: formData.size === "other" ? formData.size_other : formData.size,
        gender: formData.gender === "other" ? formData.gender_other : formData.gender,
        color: formData.color === "other" ? formData.color_other : formData.color,
        location,
        ong_id: ongId || null, // <-- MODIFICAÇÃO AQUI: Garante que ong_id seja null se não for fornecido
      }

      console.log("Enviando dados para o servidor:", processedData)

      // Enviar os dados para o servidor
      const result = await createAdoptionPet(processedData)

      console.log("Resultado do cadastro:", result)

      if (result.error) {
        onError?.(result.error)
      } else {
        setSubmitSuccess(true)
        onSuccess?.()

        // Aguardar 2 segundos antes de redirecionar
        setTimeout(() => {
          router.push("/adocao") // Redireciona para /adocao em vez de /ongs/dashboard para usuários comuns
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      console.error("Erro ao cadastrar pet:", error)
      onError?.("Erro ao cadastrar pet: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsSubmitting(false) // Sempre redefine o estado de envio, mesmo em erro
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Pet cadastrado com sucesso! Você será redirecionado em instantes...
          </AlertDescription>
        </Alert>
      )}
      {formErrors.general && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formErrors.general}</AlertDescription>
        </Alert>
      )}

      {/* Adicione um aviso para ONG se ongId e ongName forem passados */}
      {ongName && (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <AlertDescription className="text-blue-700">
            Você está cadastrando este pet em nome da ONG: **{ongName}**.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex">
            Nome do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Rex"
            required
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="species" className="flex">
              Espécie<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="species"
              value={formData.species}
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
                <SelectItem value="rabbit">Coelho</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.species && <p className="text-red-500 text-sm mt-1">{formErrors.species}</p>}

            {formData.species === "other" && (
              <div className="mt-2">
                <Label htmlFor="species_other" className="flex">
                  Especifique a espécie<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="species_other"
                  name="species_other"
                  value={formData.species_other}
                  onChange={handleChange}
                  className={formErrors.species_other ? "border-red-500" : ""}
                  required={formData.species === "other"}
                />
                {formErrors.species_other && <p className="text-red-500 text-sm mt-1">{formErrors.species_other}</p>}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="breed" className="flex">
              Raça<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Ex: Vira-lata"
              required
              className={formErrors.breed ? "border-red-500" : ""}
            />
            {formErrors.breed && <p className="text-red-500 text-sm mt-1">{formErrors.breed}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="flex">
              Idade<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="age"
              value={formData.age}
              onValueChange={(value) => handleSelectChange("age", value)}
              required
            >
              <SelectTrigger className={formErrors.age ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a idade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filhote">Filhote</SelectItem>
                <SelectItem value="Jovem">Jovem</SelectItem>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Idoso">Idoso</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.age && <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>}
          </div>

          <div>
            <Label htmlFor="gender" className="flex">
              Gênero<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="gender"
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
              required
            >
              <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Fêmea">Fêmea</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}

            {formData.gender === "other" && (
              <div className="mt-2">
                <Label htmlFor="gender_other" className="flex">
                  Especifique o gênero<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="gender_other"
                  name="gender_other"
                  value={formData.gender_other}
                  onChange={handleChange}
                  className={formErrors.gender_other ? "border-red-500" : ""}
                  required={formData.gender === "other"}
                />
                {formErrors.gender_other && <p className="text-red-500 text-sm mt-1">{formErrors.gender_other}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size" className="flex">
              Porte<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="size"
              value={formData.size}
              onValueChange={(value) => handleSelectChange("size", value)}
              required
            >
              <SelectTrigger className={formErrors.size ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pequeno">Pequeno</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Grande">Grande</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.size && <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>}

            {formData.size === "other" && (
              <div className="mt-2">
                <Label htmlFor="size_other" className="flex">
                  Especifique o porte<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="size_other"
                  name="size_other"
                  value={formData.size_other}
                  onChange={handleChange}
                  className={formErrors.size_other ? "border-red-500" : ""}
                  required={formData.size === "other"}
                />
                {formErrors.size_other && <p className="text-red-500 text-sm mt-1">{formErrors.size_other}</p>}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="color" className="flex">
              Cor<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="color"
              value={formData.color}
              onValueChange={(value) => handleSelectChange("color", value)}
              required
            >
              <SelectTrigger className={formErrors.color ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Preto">Preto</SelectItem>
                <SelectItem value="Branco">Branco</SelectItem>
                <SelectItem value="Marrom">Marrom</SelectItem>
                <SelectItem value="Cinza">Cinza</SelectItem>
                <SelectItem value="Dourado">Dourado</SelectItem>
                <SelectItem value="Malhado">Malhado</SelectItem>
                <SelectItem value="Tricolor">Tricolor</SelectItem>
                <SelectItem value="other">Outra</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.color && <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>}

            {formData.color === "other" && (
              <div className="mt-2">
                <Label htmlFor="color_other" className="flex">
                  Especifique a cor<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="color_other"
                  name="color_other"
                  value={formData.color_other}
                  onChange={handleChange}
                  className={formErrors.color_other ? "border-red-500" : ""}
                  required={formData.color === "other"}
                />
                {formErrors.color_other && <p className="text-red-500 text-sm mt-1">{formErrors.color_other}</p>}
              </div>
            )}
          </div>
        </div>

        <SimpleLocationSelector
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          required={true}
          initialState={formData.state}
          initialCity={formData.city}
        />
        {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
        {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}

        <div>
          <Label htmlFor="contact" className="flex">
            Contato (WhatsApp)<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Ex: (11) 98765-4321"
            required
            className={formErrors.contact ? "border-red-500" : ""}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Número de telefone ou WhatsApp para contato sobre este pet
          </p>
          {formErrors.contact && <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>}
        </div>

        <div>
          <Label htmlFor="description" className="flex">
            Descrição do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o pet, sua personalidade, história, etc."
            className={`min-h-32 ${formErrors.description ? "border-red-500" : ""}`}
            required
          />
          {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vaccinated"
              checked={formData.is_vaccinated}
              onCheckedChange={(checked) => handleCheckboxChange("is_vaccinated", checked === true)}
            />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Vacinado
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_neutered"
              checked={formData.is_neutered}
              onCheckedChange={(checked) => handleCheckboxChange("is_neutered", checked === true)}
            />
            <Label htmlFor="is_neutered" className="cursor-pointer">
              Castrado
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="special_needs">Necessidades Especiais</Label>
          <Textarea
            id="special_needs"
            name="special_needs"
            value={formData.special_needs}
            onChange={handleChange}
            placeholder="Descreva se o pet tem alguma necessidade especial, condição médica, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperament">Temperamento</Label>
            <Select
              name="temperament"
              value={formData.temperament}
              onValueChange={(value) => handleSelectChange("temperament", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o temperamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Calmo">Calmo</SelectItem>
                <SelectItem value="Equilibrado">Equilibrado</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Brincalhão">Brincalhão</SelectItem>
                <SelectItem value="Tímido">Tímido</SelectItem>
                <SelectItem value="Protetor">Protetor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="energy_level">Nível de Energia</Label>
            <RadioGroup
              value={formData.energy_level}
              onValueChange={(value) => handleSelectChange("energy_level", value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Baixo" id="energy_low" />
                <Label htmlFor="energy_low" className="cursor-pointer font-normal">
                  Baixo
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Médio" id="energy_medium" />
                <Label htmlFor="energy_medium" className="cursor-pointer font-normal">
                  Médio
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Alto" id="energy_high" />
                <Label htmlFor="energy_high" className="cursor-pointer font-normal">
                  Alto
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div>
          <Label className="flex">
            Foto do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <ImageUpload value={formData.image_url} onChange={handleImageChange} required folder="pets_adoption" />
          <p className="text-xs text-muted-foreground mt-1">
            Esta será a imagem principal exibida nos resultados de busca.
          </p>
          {formErrors.image_url && <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar Pet"}
        </Button>
      </div>
    </form>
  )
}
