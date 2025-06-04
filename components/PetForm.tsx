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
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "./ImageUpload"

// Tipos para os dados do pet
interface PetData {
  id?: string
  name: string
  species: string
  breed: string
  age: number
  gender: string
  size: string
  color: string
  description: string
  is_special_needs: boolean
  special_needs_description: string
  contact_phone: string
  contact_email: string
  images?: string[]
  status: string
  user_id?: string
  ong_id?: string
}

interface PetFormProps {
  initialData?: PetData
  isEditing?: boolean
}

const defaultPetData: PetData = {
  name: "",
  species: "dog",
  breed: "",
  age: 0,
  gender: "male",
  size: "medium",
  color: "",
  description: "",
  is_special_needs: false,
  special_needs_description: "",
  contact_phone: "",
  contact_email: "",
  images: [],
  status: "available",
}

export default function PetForm({ initialData, isEditing = false }: PetFormProps) {
  const [petData, setPetData] = useState<PetData>(initialData || defaultPetData)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (initialData) {
      setPetData(initialData)
      setImages(initialData.images || [])
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setPetData((prev) => ({ ...prev, is_special_needs: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para cadastrar um pet.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const updatedPetData = {
        ...petData,
        images,
        user_id: user.id,
      }

      let response

      if (isEditing && petData.id) {
        // Atualizar pet existente
        response = await supabase.from("pets").update(updatedPetData).eq("id", petData.id)
      } else {
        // Criar novo pet
        response = await supabase.from("pets").insert([updatedPetData])
      }

      if (response.error) {
        throw response.error
      }

      toast({
        title: isEditing ? "Pet atualizado" : "Pet cadastrado",
        description: isEditing ? "Seu pet foi atualizado com sucesso!" : "Seu pet foi cadastrado com sucesso!",
      })

      router.push("/my-pets")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar pet:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pet. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Pet</Label>
          <Input id="name" name="name" value={petData.name} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="species">Espécie</Label>
            <Select
              name="species"
              value={petData.species}
              onValueChange={(value) => handleSelectChange("species", value)}
            >
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
          </div>

          <div>
            <Label htmlFor="breed">Raça</Label>
            <Input id="breed" name="breed" value={petData.breed} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="age">Idade (anos)</Label>
            <Input id="age" name="age" type="number" min="0" value={petData.age} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select name="gender" value={petData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Macho</SelectItem>
                <SelectItem value="female">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="size">Porte</Label>
            <Select name="size" value={petData.size} onValueChange={(value) => handleSelectChange("size", value)}>
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
        </div>

        <div>
          <Label htmlFor="color">Cor</Label>
          <Input id="color" name="color" value={petData.color} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" value={petData.description} onChange={handleChange} rows={4} />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="is_special_needs" checked={petData.is_special_needs} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="is_special_needs">Possui necessidades especiais</Label>
        </div>

        {petData.is_special_needs && (
          <div>
            <Label htmlFor="special_needs_description">Descreva as necessidades especiais</Label>
            <Textarea
              id="special_needs_description"
              name="special_needs_description"
              value={petData.special_needs_description}
              onChange={handleChange}
              rows={3}
            />
          </div>
        )}

        <div>
          <Label htmlFor="contact_phone">Telefone para contato</Label>
          <Input id="contact_phone" name="contact_phone" value={petData.contact_phone} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="contact_email">Email para contato</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={petData.contact_email}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Fotos do Pet</Label>
          <ImageUpload images={images} setImages={setImages} folder="pets" />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={petData.status} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Disponível para adoção</SelectItem>
              <SelectItem value="pending">Em processo de adoção</SelectItem>
              <SelectItem value="adopted">Adotado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Atualizar Pet" : "Cadastrar Pet"}
        </Button>
      </div>
    </form>
  )
}
