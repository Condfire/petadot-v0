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
import { ImageUpload } from "@/components/ImageUpload"
import { SimpleLocationSelector } from "@/components/simple-location-selector"
import OtherOptionField from "./other-option-field"

interface AdoptionPetFormProps {
  action: (formData: FormData) => void
  ongId?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Cadastrando..." : "Cadastrar Pet"}
    </Button>
  )
}

export function AdoptionPetForm({ action, ongId }: AdoptionPetFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [species, setSpecies] = useState("dog")
  const [gender, setGender] = useState("Macho")
  const [size, setSize] = useState("Pequeno")
  const [color, setColor] = useState("Preto")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")

  return (
    <form action={action} method="post" className="space-y-6 max-w-2xl mx-auto">
      {ongId && <input type="hidden" name="ong_id" value={ongId} />}
      <input type="hidden" name="main_image_url" value={imageUrl} />

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex">
            Nome do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input id="name" name="name" placeholder="Ex: Rex" required />
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
                <SelectItem value="rabbit">Coelho</SelectItem>
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
            <Label htmlFor="breed" className="flex">
              Raça<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input id="breed" name="breed" placeholder="Ex: Vira-lata" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="flex">
              Idade<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="age" required defaultValue="Jovem">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a idade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Filhote">Filhote</SelectItem>
                <SelectItem value="Jovem">Jovem</SelectItem>
                <SelectItem value="Adulto">Adulto</SelectItem>
                <SelectItem value="Idoso">Idoso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender" className="flex">
              Gênero<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="gender" required onValueChange={setGender} defaultValue="Macho">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Fêmea">Fêmea</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <OtherOptionField isOtherSelected={gender === "other"} name="gender_other" label="Qual gênero?" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size" className="flex">
              Porte<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="size" required onValueChange={setSize} defaultValue="Pequeno">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pequeno">Pequeno</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Grande">Grande</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            <OtherOptionField isOtherSelected={size === "other"} name="size_other" label="Qual porte?" required />
          </div>

          <div>
            <Label htmlFor="color" className="flex">
              Cor<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="color" required onValueChange={setColor} defaultValue="Preto">
              <SelectTrigger>
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
            <OtherOptionField isOtherSelected={color === "other"} name="color_other" label="Qual cor?" required />
          </div>
        </div>

        <SimpleLocationSelector
          onStateChange={setState}
          onCityChange={setCity}
          required={true}
        />
        <input type="hidden" name="state" value={state} />
        <input type="hidden" name="city" value={city} />

        <div>
          <Label htmlFor="contact" className="flex">
            Contato (WhatsApp)<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input id="contact" name="contact" placeholder="Ex: (11) 98765-4321" required />
          <p className="text-xs text-muted-foreground mt-1">
            Número de telefone ou WhatsApp para contato sobre este pet
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="flex">
            Descrição do Pet<span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Descreva o pet, sua personalidade, história, etc."
            className="min-h-32"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="is_vaccinated" name="is_vaccinated" />
            <Label htmlFor="is_vaccinated" className="cursor-pointer">
              Vacinado
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_castrated" name="is_castrated" />
            <Label htmlFor="is_castrated" className="cursor-pointer">
              Castrado
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="special_needs">Necessidades Especiais</Label>
          <Textarea
            id="special_needs"
            name="special_needs_description"
            placeholder="Descreva se o pet tem alguma necessidade especial, condição médica, etc."
          />
          <input type="hidden" name="is_special_needs" value="on" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperament">Temperamento</Label>
            <Select name="temperament">
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
            <RadioGroup name="energy_level" className="flex space-x-4 mt-2">
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
          <ImageUpload value={imageUrl} onChange={setImageUrl} required folder="pets_adoption" />
          <p className="text-xs text-muted-foreground mt-1">
            Esta será a imagem principal exibida nos resultados de busca.
          </p>
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
