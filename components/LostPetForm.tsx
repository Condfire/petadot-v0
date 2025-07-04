"use client"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ImageUpload from "./ImageUpload"
import SimpleStateCitySelector from "@/components/simple-state-city-selector"
import OtherOptionField from "@/components/other-option-field"
import { useState } from "react"

interface LostPetFormProps {
  action: (formData: FormData) => void
  userId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Reportando..." : "Reportar Pet Perdido"}
    </Button>
  )
}

export function LostPetForm({ action, userId }: LostPetFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(false)
  const [species, setSpecies] = useState("dog")
  const [size, setSize] = useState("medium")
  const [color, setColor] = useState("black")
  const [gender, setGender] = useState("male")

  return (
    <form action={action} className="space-y-6 max-w-2xl mx-auto">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Pet (opcional)</Label>
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
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="bird">Pássaro</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <OtherOptionField
              isOtherSelected={species === "other"}
              name="species_other"
              label="Qual espécie?"
              required
            />
          </div>

          <div>
            <Label htmlFor="breed">Raça (opcional)</Label>
            <Input id="breed" name="breed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="age">Idade (opcional)</Label>
            <Input id="age" name="age" />
          </div>

          <div>
            <Label htmlFor="size" className="flex">
              Porte<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="size" required onValueChange={setSize} defaultValue="medium">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <OtherOptionField isOtherSelected={size === "other"} name="size_other" label="Qual porte?" required />
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
            <OtherOptionField isOtherSelected={color === "other"} name="color_other" label="Qual cor?" required />
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
              <RadioGroupItem value="other" id="gender-other" />
              <Label htmlFor="gender-other" className="cursor-pointer">
                Outro
              </Label>
            </div>
          </RadioGroup>
          <OtherOptionField isOtherSelected={gender === "other"} name="gender_other" label="Qual gênero?" required />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="is_vaccinated" name="is_vaccinated" />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Vacinado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_neutered" name="is_neutered" />
            <Label htmlFor="is_neutered" className="cursor-pointer">
              Castrado
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
              Necessidades Especiais
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
              Bom com crianças
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="good_with_cats" name="good_with_cats" />
            <Label htmlFor="good_with_cats" className="cursor-pointer">
              Bom com gatos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="good_with_dogs" name="good_with_dogs" />
            <Label htmlFor="good_with_dogs" className="cursor-pointer">
              Bom com cães
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea id="description" name="description" rows={3} />
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
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="last_seen_location" className="flex">
              Local onde foi visto pela última vez<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input id="last_seen_location" name="last_seen_location" required />
          </div>
        </div>

        <SimpleStateCitySelector onStateChange={() => {}} onCityChange={() => {}} required={false} />

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
          <ImageUpload value={imageUrl} onChange={setImageUrl} required folder="pets_lost" />
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

export default LostPetForm
