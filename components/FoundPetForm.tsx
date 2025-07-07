"use client"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ImageUpload from "./ImageUpload"
import { SimpleLocationSelector } from "./simple-location-selector"
import OtherOptionField from "./other-option-field"

interface FoundPetFormProps {
  action: (formData: FormData) => void
  userId: string
}

const speciesMap: { [key: string]: string } = {
  dog: "Cachorro",
  cat: "Gato",
  bird: "Pássaro",
  rabbit: "Coelho",
  other: "Outro",
}

const sizeMap: { [key: string]: string } = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  other: "Outro",
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Reportando..." : "Reportar Pet Encontrado"}
    </Button>
  )
}

export default function FoundPetForm({ action, userId }: FoundPetFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(false)
  const [species, setSpecies] = useState("dog")
  const [size, setSize] = useState("medium")
  const [color, setColor] = useState("black")
  const [gender, setGender] = useState("male")
  const [speciesOther, setSpeciesOther] = useState("")
  const [sizeOther, setSizeOther] = useState("")
  const [colorOther, setColorOther] = useState("")
  const [genderOther, setGenderOther] = useState("")

  return (
    <form action={action} className="space-y-6 max-w-2xl mx-auto">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="main_image_url" value={imageUrl} />

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Pet (se souber)</Label>
          <Input id="name" name="name" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="species" className="flex">
              Espécie<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="species" required onValueChange={setSpecies} defaultValue="dog">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a espécie" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(speciesMap).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <OtherOptionField
              isOtherSelected={species === "other"}
              value={speciesOther}
              onChange={setSpeciesOther}
              label="Qual espécie?"
              required
            />
            <input type="hidden" name="species_other" value={speciesOther} />
          </div>

          <div>
            <Label htmlFor="breed">Raça (se souber)</Label>
            <Input id="breed" name="breed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size" className="flex">
              Porte<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="size" required onValueChange={setSize} defaultValue="medium">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sizeMap).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <OtherOptionField
              isOtherSelected={size === "other"}
              value={sizeOther}
              onChange={setSizeOther}
              label="Qual porte?"
              required
            />
            <input type="hidden" name="size_other" value={sizeOther} />
          </div>

          <div>
            <Label htmlFor="color" className="flex">
              Cor<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="color" required onValueChange={setColor} defaultValue="black">
              <SelectTrigger>
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
            <OtherOptionField
              isOtherSelected={color === "other"}
              value={colorOther}
              onChange={setColorOther}
              label="Qual cor?"
              required
            />
            <input type="hidden" name="color_other" value={colorOther} />
          </div>
        </div>

        <div>
          <Label className="flex">
            Gênero<span className="text-red-500 ml-1">*</span>
          </Label>
          <RadioGroup name="gender" defaultValue="male" onValueChange={setGender} className="flex gap-4 mt-2" required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="cursor-pointer">
                Macho
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="cursor-pointer">
                Fêmea
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="unknown" />
              <Label htmlFor="unknown" className="cursor-pointer">
                Não sei
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="gender_other_radio" />
              <Label htmlFor="gender_other_radio" className="cursor-pointer">
                Outro
              </Label>
            </div>
          </RadioGroup>
          <OtherOptionField
            isOtherSelected={gender === "other"}
            value={genderOther}
            onChange={setGenderOther}
            label="Qual gênero?"
            required
          />
          <input type="hidden" name="gender_other" value={genderOther} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="is_vaccinated" name="is_vaccinated" />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Parece vacinado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_neutered" name="is_neutered" />
            <Label htmlFor="is_neutered" className="cursor-pointer">
              Parece castrado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_special_needs"
              name="is_special_needs"
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
            <Textarea id="special_needs_description" name="special_needs_description" rows={2} required />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="good_with_kids" name="good_with_kids" />
            <Label htmlFor="good_with_kids" className="cursor-pointer">
              Parece bom com crianças
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="good_with_cats" name="good_with_cats" />
            <Label htmlFor="good_with_cats" className="cursor-pointer">
              Parece bom com gatos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="good_with_dogs" name="good_with_dogs" />
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
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="found_location" className="flex">
              Local onde foi encontrado<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input id="found_location" name="found_location" required placeholder="Ex: Rua das Flores, Centro" />
          </div>
        </div>

        <SimpleLocationSelector onStateChange={() => {}} onCityChange={() => {}} required={false} />

        <div>
          <Label htmlFor="current_location">Localização atual do pet (opcional)</Label>
          <Input id="current_location" name="current_location" placeholder="Onde o pet está atualmente" />
        </div>

        <div>
          <Label htmlFor="contact" className="flex">
            Contato para informações<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input id="contact" name="contact" required placeholder="Telefone, WhatsApp ou e-mail" />
        </div>

        <div>
          <Label className="flex">
            Foto do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} required folder="pets_found" userId={userId} />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <SubmitButton />
      </div>
    </form>
  )
}

export { FoundPetForm }
