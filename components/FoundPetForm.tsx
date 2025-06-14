"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, XCircle } from "lucide-react"
import ImageUpload from "./ImageUpload"
import { SimpleLocationSelector } from "./simple-location-selector"
// Importar useUser
import { useUser } from "@supabase/auth-helpers-react"

interface FoundPetData {
  id?: string
  name?: string
  species: string
  species_other?: string
  breed?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color: string
  color_other?: string
  description?: string
  found_date: string
  found_location: string
  current_location?: string
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

interface FoundPetFormProps {
  initialData?: FoundPetData
  isEditing?: boolean
}

// Ajustar o status padrão para 'pending'
const defaultFoundPetData: FoundPetData = {
  name: "",
  species: "dog",
  species_other: "",
  breed: "",
  size: "medium",
  size_other: "",
  gender: "male",
  gender_other: "",
  color: "black",
  color_other: "",
  description: "",
  found_date: new Date().toISOString().split("T")[0],
  found_location: "",
  current_location: "",
  contact: "",
  image_url: "",
  is_special_needs: false,
  special_needs_description: "",
  good_with_kids: false,
  good_with_cats: false,
  good_with_dogs: false,
  is_vaccinated: false,
  is_neutered: false,
  // ... outras propriedades
  status: "pending", // Alterado de "approved" para "pending"
  // ...
  state: "",
  city: "",
}

// Função para verificar palavras-chave bloqueadas
async function checkForBlockedKeywords(
  content: string,
  supabase: any,
): Promise<{ blocked: boolean; keyword?: string }> {
  try {
    // Verificar se a moderação está habilitada
    const { data: setting } = await supabase
      .from("moderation_settings")
      .select("setting_value")
      .eq("setting_key", "enable_keyword_moderation")
      .single()

    if (!setting || !setting.setting_value?.enabled) {
      return { blocked: false }
    }

    // Buscar palavras-chave ativas
    const { data: keywords } = await supabase.from("moderation_keywords").select("keyword").eq("is_active", true)

    if (!keywords || keywords.length === 0) {
      return { blocked: false }
    }

    // Verificar se o conteúdo contém alguma palavra bloqueada
    const lowerContent = content.toLowerCase()
    for (const kw of keywords) {
      if (lowerContent.includes(kw.keyword.toLowerCase())) {
        return { blocked: true, keyword: kw.keyword }
      }
    }

    return { blocked: false }
  } catch (error) {
    console.error("Erro ao verificar palavras-chave:", error)
    return { blocked: false }
  }
}

function FoundPetForm({ initialData, isEditing = false }: FoundPetFormProps) {
  const [petData, setPetData] = useState<FoundPetData>(initialData || defaultFoundPetData)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(initialData?.is_special_needs || false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [rejectedByModeration, setRejectedByModeration] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Dentro da função FoundPetForm, antes do return:
  const { user } = useUser() // Obtenha o usuário autenticado aqui

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

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (value !== "other") {
      const otherFieldName = `${name}_other` as keyof FoundPetData
      if (petData[otherFieldName]) {
        setPetData((prev) => ({ ...prev, [otherFieldName]: "" }))
      }
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

    if (!petData.species) errors.species = "Espécie é obrigatória"
    if (petData.species === "other" && !petData.species_other) errors.species_other = "Especifique a espécie"
    if (!petData.size) errors.size = "Porte é obrigatório"
    if (petData.size === "other" && !petData.size_other) errors.size_other = "Especifique o porte"
    if (!petData.gender) errors.gender = "Gênero é obrigatório"
    if (petData.gender === "other" && !petData.gender_other) errors.gender_other = "Especifique o gênero"
    if (!petData.color) errors.color = "Cor é obrigatória"
    if (petData.color === "other" && !petData.color_other) errors.color_other = "Especifique a cor"
    if (!petData.found_date) errors.found_date = "Data em que foi encontrado é obrigatória"
    if (!petData.found_location) errors.found_location = "Local onde foi encontrado é obrigatório"
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
    e.stopPropagation()

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reportar um pet encontrado.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Verificar moderação por palavras-chave
      const contentToCheck = `${petData.name || ""} ${petData.description || ""} ${petData.found_location || ""} ${petData.current_location || ""}`
      const { blocked, keyword } = await checkForBlockedKeywords(contentToCheck, supabase)

      let finalStatus = "approved"
      let finalRejectionReason = null

      if (blocked && keyword) {
        finalStatus = "rejected"
        finalRejectionReason = `Rejeitado automaticamente: palavra-chave proibida "${keyword}"`
        setRejectedByModeration(true)
        setRejectionReason(finalRejectionReason)
      }

      // Preparar dados básicos para inserção
      const newPetData = {
        name: petData.name,
        species: petData.species === "other" ? petData.species_other : petData.species,
        breed: petData.breed,
        size: petData.size === "other" ? petData.size_other : petData.size,
        gender: petData.gender === "other" ? petData.gender_other : petData.gender,
        color: petData.color === "other" ? petData.color_other : petData.color,
        description: petData.description,
        found_date: petData.found_date,
        found_location: petData.found_location,
        current_location: petData.current_location,
        contact: petData.contact,
        main_image_url: imageUrl,
        is_special_needs: isSpecialNeeds,
        special_needs_description: petData.special_needs_description,
        good_with_kids: petData.good_with_kids,
        good_with_cats: petData.good_with_cats,
        good_with_dogs: petData.good_with_dogs,
        is_vaccinated: petData.is_vaccinated,
        is_neutered: petData.is_neutered,
        status: finalStatus,
        user_id: user.id,
        state: petData.state,
        city: petData.city,
        category: "found",
      }

      // Adicionar rejection_reason apenas se o pet foi rejeitado
      if (finalStatus === "rejected" && finalRejectionReason) {
        newPetData.rejection_reason = finalRejectionReason
      }

      const response = await supabase.from("pets").insert([newPetData])

      if (response.error) {
        throw response.error
      }

      setSubmitSuccess(true)

      if (blocked) {
        toast({
          title: "Pet cadastrado mas rejeitado",
          description: `Pet foi rejeitado automaticamente devido à palavra-chave proibida: "${keyword}". Entre em contato com o suporte se isso foi um erro.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Pet reportado",
          description: "O pet encontrado foi reportado com sucesso!",
        })
      }

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/encontrados")
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error("Erro ao salvar pet encontrado:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pet encontrado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {submitSuccess && !rejectedByModeration && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Pet reportado com sucesso! Você será redirecionado em instantes...
          </AlertDescription>
        </Alert>
      )}

      {submitSuccess && rejectedByModeration && (
        <Alert className="bg-red-50 border-red-200 mb-4">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Pet rejeitado automaticamente!</strong>
            <br />
            {rejectionReason}
            <br />
            <em>Entre em contato com o suporte se isso foi um erro.</em>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Pet (se souber)</Label>
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

            {petData.species === "other" && (
              <div className="mt-2">
                <Label htmlFor="species_other" className="flex">
                  Especifique a espécie<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="species_other"
                  name="species_other"
                  value={petData.species_other || ""}
                  onChange={handleChange}
                  className={formErrors.species_other ? "border-red-500" : ""}
                  required={petData.species === "other"}
                />
                {formErrors.species_other && <p className="text-red-500 text-sm mt-1">{formErrors.species_other}</p>}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="breed">Raça (se souber)</Label>
            <Input id="breed" name="breed" value={petData.breed || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {petData.size === "other" && (
              <div className="mt-2">
                <Label htmlFor="size_other" className="flex">
                  Especifique o porte<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="size_other"
                  name="size_other"
                  value={petData.size_other || ""}
                  onChange={handleChange}
                  className={formErrors.size_other ? "border-red-500" : ""}
                  required={petData.size === "other"}
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

            {petData.color === "other" && (
              <div className="mt-2">
                <Label htmlFor="color_other" className="flex">
                  Especifique a cor<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="color_other"
                  name="color_other"
                  value={petData.color_other || ""}
                  onChange={handleChange}
                  className={formErrors.color_other ? "border-red-500" : ""}
                  required={petData.color === "other"}
                />
                {formErrors.color_other && <p className="text-red-500 text-sm mt-1">{formErrors.color_other}</p>}
              </div>
            )}
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
              <RadioGroupItem value="unknown" id="unknown" className={formErrors.gender ? "border-red-500" : ""} />
              <Label htmlFor="unknown" className="cursor-pointer">
                Não sei
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="gender_other" className={formErrors.gender ? "border-red-500" : ""} />
              <Label htmlFor="gender_other" className="cursor-pointer">
                Outro
              </Label>
            </div>
          </RadioGroup>
          {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}

          {petData.gender === "other" && (
            <div className="mt-2">
              <Label htmlFor="gender_other_input" className="flex">
                Especifique o gênero<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="gender_other_input"
                name="gender_other"
                value={petData.gender_other || ""}
                onChange={handleChange}
                className={formErrors.gender_other ? "border-red-500" : ""}
                required={petData.gender === "other"}
              />
              {formErrors.gender_other && <p className="text-red-500 text-sm mt-1">{formErrors.gender_other}</p>}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_vaccinated"
              checked={petData.is_vaccinated}
              onCheckedChange={(checked) => handleCheckboxChange("is_vaccinated", checked === true)}
            />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Parece vacinado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_neutered"
              checked={petData.is_neutered}
              onCheckedChange={(checked) => handleCheckboxChange("is_neutered", checked === true)}
            />
            <Label htmlFor="is_neutered" className="cursor-pointer">
              Parece castrado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_special_needs"
              checked={isSpecialNeeds}
              onCheckedChange={(checked) => setIsSpecialNeeds(checked === true)}
            />
            <Label htmlFor="is_special_needs" className="cursor-pointer">
              Tem necessidades especiais
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
              Parece bom com crianças
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="good_with_cats"
              checked={petData.good_with_cats}
              onCheckedChange={(checked) => handleCheckboxChange("good_with_cats", checked === true)}
            />
            <Label htmlFor="good_with_cats" className="cursor-pointer">
              Parece bom com gatos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="good_with_dogs"
              checked={petData.good_with_dogs}
              onCheckedChange={(checked) => handleCheckboxChange("good_with_dogs", checked === true)}
            />
            <Label htmlFor="good_with_dogs" className="cursor-pointer">
              Parece bom com cães
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
            placeholder="Descreva detalhes sobre o pet encontrado..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="found_date" className="flex">
              Data em que foi encontrado<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="found_date"
              name="found_date"
              type="date"
              value={petData.found_date}
              onChange={handleChange}
              required
              className={formErrors.found_date ? "border-red-500" : ""}
            />
            {formErrors.found_date && <p className="text-red-500 text-sm mt-1">{formErrors.found_date}</p>}
          </div>

          <div>
            <Label htmlFor="found_location" className="flex">
              Local onde foi encontrado<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="found_location"
              name="found_location"
              value={petData.found_location}
              onChange={handleChange}
              required
              className={formErrors.found_location ? "border-red-500" : ""}
              placeholder="Ex: Rua das Flores, Centro"
            />
            {formErrors.found_location && <p className="text-red-500 text-sm mt-1">{formErrors.found_location}</p>}
          </div>
        </div>

        <SimpleLocationSelector
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          required={false}
          initialState={petData.state}
          initialCity={petData.city}
        />

        <div>
          <Label htmlFor="current_location">Localização atual do pet (opcional)</Label>
          <Input
            id="current_location"
            name="current_location"
            value={petData.current_location || ""}
            onChange={handleChange}
            placeholder="Onde o pet está atualmente"
          />
        </div>

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
          {/* Na seção de renderização, no componente ImageUpload: */}
          <ImageUpload value={imageUrl} onChange={setImageUrl} required folder="pets_found" userId={user?.id} />
          {formErrors.image_url && <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Reportar Pet Encontrado"}
        </Button>
      </div>
    </form>
  )
}

export { FoundPetForm }
export default FoundPetForm
