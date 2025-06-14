"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-provider"
import { getLostPetById, supabase } from "@/lib/supabase"
import RequireAuth from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "@/components/image-upload"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EditLostPetPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <EditLostPetForm id={params.id} />
    </RequireAuth>
  )
}

function EditLostPetForm({ id }: { id: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pet, setPet] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    species: "Cachorro",
    breed: "",
    age: "Filhote",
    size: "Pequeno",
    gender: "Macho",
    color: "",
    description: "",
    last_seen_date: "",
    last_seen_location: "",
    contact: "",
    image_url: "",
  })

  useEffect(() => {
    async function loadPet() {
      if (!user) return

      try {
        const petData = await getLostPetById(id)

        if (!petData) {
          toast({
            title: "Pet não encontrado",
            description: "O pet que você está tentando editar não foi encontrado.",
            variant: "destructive",
          })
          router.push("/my-pets")
          return
        }

        // Verificar se o pet pertence ao usuário
        if (petData.user_id !== user.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para editar este pet.",
            variant: "destructive",
          })
          router.push("/my-pets")
          return
        }

        setPet(petData)
        setFormData({
          name: petData.name || "",
          species: petData.species || "Cachorro",
          breed: petData.breed || "",
          age: petData.age || "Filhote",
          size: petData.size || "Pequeno",
          gender: petData.gender || "Macho",
          color: petData.color || "",
          description: petData.description || "",
          last_seen_date: petData.last_seen_date ? new Date(petData.last_seen_date).toISOString().split("T")[0] : "",
          last_seen_location: petData.last_seen_location || "",
          contact: petData.contact || "",
          image_url: petData.image_url || "",
        })
      } catch (error) {
        console.error("Erro ao carregar pet:", error)
        toast({
          title: "Erro ao carregar pet",
          description: "Ocorreu um erro ao carregar os dados do pet. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPet()
  }, [id, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsSaving(true)

    try {
      // Vamos fazer um log dos dados que estamos enviando para debug
      console.log("Atualizando pet perdido com os dados:", formData)

      const { error } = await supabase
        .from("pets_lost")
        .update({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: formData.age,
          size: formData.size,
          gender: formData.gender,
          color: formData.color,
          description: formData.description,
          last_seen_date: formData.last_seen_date,
          last_seen_location: formData.last_seen_location,
          contact: formData.contact,
          image_url: formData.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Pet atualizado com sucesso",
        description: "As informações do pet foram atualizadas com sucesso.",
      })

      router.push("/my-pets")
    } catch (error) {
      console.error("Erro ao atualizar pet:", error)
      toast({
        title: "Erro ao atualizar pet",
        description: "Ocorreu um erro ao atualizar as informações do pet. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pet não encontrado</h2>
          <p className="text-gray-500 mb-4">O pet que você está tentando editar não foi encontrado.</p>
          <Button asChild>
            <a href="/my-pets">Voltar para Meus Pets</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Editar Pet Perdido</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pet</CardTitle>
          <CardDescription>
            Atualize as informações do seu pet perdido. Quanto mais detalhes você fornecer, maiores as chances de
            encontrá-lo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Pet (opcional)</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Espécie*</Label>
                  <Select value={formData.species} onValueChange={(value) => handleSelectChange("species", value)}>
                    <SelectTrigger id="species">
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cachorro">Cachorro</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Ave">Ave</SelectItem>
                      <SelectItem value="Roedor">Roedor</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Raça (opcional)</Label>
                  <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade*</Label>
                  <Select value={formData.age} onValueChange={(value) => handleSelectChange("age", value)}>
                    <SelectTrigger id="age">
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

                <div className="space-y-2">
                  <Label htmlFor="size">Porte*</Label>
                  <Select value={formData.size} onValueChange={(value) => handleSelectChange("size", value)}>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pequeno">Pequeno</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo*</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Cor*</Label>
                  <Input id="color" name="color" value={formData.color} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Descreva características marcantes, comportamento, se usa coleira, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_seen_date">Data em que foi visto pela última vez*</Label>
                  <Input
                    id="last_seen_date"
                    name="last_seen_date"
                    type="date"
                    value={formData.last_seen_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_seen_location">Local onde foi visto pela última vez*</Label>
                  <Input
                    id="last_seen_location"
                    name="last_seen_location"
                    value={formData.last_seen_location}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Rua, bairro, ponto de referência"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contato para informações*</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="Nome e telefone para contato"
                />
              </div>

              <div className="space-y-2">
                <Label>Foto do Pet</Label>
                <ImageUpload value={formData.image_url} onChange={handleImageUpload} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
