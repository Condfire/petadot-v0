"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Pet = {
  id: string
  name: string
  category: string
  species: string
  breed: string | null
  color: string | null
  size: string | null
  gender: string | null
  age: string | null
  description: string | null
  status: string
  city: string
  state: string
  contact_phone: string | null
  contact_whatsapp: string | null
  main_image_url: string | null
  users?: {
    name: string
    email: string
  }
}

export function PetEditForm({ pet }: { pet: Pet }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: pet.name || "",
    species: pet.species || "",
    breed: pet.breed || "",
    color: pet.color || "",
    size: pet.size || "",
    gender: pet.gender || "",
    age: pet.age || "",
    description: pet.description || "",
    status: pet.status || "pending",
    city: pet.city || "",
    state: pet.state || "",
    contact_phone: pet.contact_phone || "",
    contact_whatsapp: pet.contact_whatsapp || "",
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("pets").update(formData).eq("id", pet.id)

      if (error) {
        console.error("Erro ao atualizar pet:", error)
        toast.error("Erro ao atualizar pet")
        return
      }

      toast.success("Pet atualizado com sucesso!")
      router.push("/admin/pets")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar pet:", error)
      toast.error("Erro ao atualizar pet")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Pet</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="species">Espécie</Label>
          <Select value={formData.species} onValueChange={(value) => handleChange("species", value)}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="breed">Raça</Label>
          <Input id="breed" value={formData.breed} onChange={(e) => handleChange("breed", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input id="color" value={formData.color} onChange={(e) => handleChange("color", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Porte</Label>
          <Select value={formData.size} onValueChange={(value) => handleChange("size", value)}>
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
        <div className="space-y-2">
          <Label htmlFor="gender">Sexo</Label>
          <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Macho</SelectItem>
              <SelectItem value="female">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            placeholder="Ex: 2 anos"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Telefone de Contato</Label>
          <Input
            id="contact_phone"
            value={formData.contact_phone}
            onChange={(e) => handleChange("contact_phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_whatsapp">WhatsApp</Label>
          <Input
            id="contact_whatsapp"
            value={formData.contact_whatsapp}
            onChange={(e) => handleChange("contact_whatsapp", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status de Moderação</Label>
        <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
