"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createFoundPet } from "@/app/actions/pet-actions"
import { useAuth } from "@/app/auth-provider"
import { LocationSelector } from "@/components/location-selector"
import { ImageUploadManager } from "@/components/image-upload-manager"

export default function CadastrarPetEncontradoClient() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async (formData: FormData) => {
    if (!user) {
      toast.error("Você precisa estar logado para cadastrar um pet")
      return
    }

    // Add location and images to form data
    formData.set("state", selectedState)
    formData.set("city", selectedCity)

    // Add images to form data
    images.forEach((image) => {
      formData.append("images", image)
    })

    console.log("📤 Submitting found pet form...")

    startTransition(async () => {
      try {
        const result = await createFoundPet(formData)

        if (result.success) {
          console.log("✅ Pet encontrado cadastrado com sucesso:", result.data)
          toast.success("Pet encontrado cadastrado com sucesso!")

          // Redirect to my pets page
          setTimeout(() => {
            router.push("/my-pets")
          }, 1000)
        } else {
          console.error("❌ Erro ao cadastrar pet encontrado:", result.error)
          toast.error(result.error || "Erro ao cadastrar pet encontrado")
        }
      } catch (error) {
        console.error("❌ Erro inesperado:", error)
        toast.error("Erro inesperado ao cadastrar pet encontrado")
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Cadastrar Pet Encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome (se souber)</Label>
                <Input id="name" name="name" placeholder="Ex: Rex, ou deixe em branco" disabled={isPending} />
              </div>

              <div>
                <Label htmlFor="species">Espécie *</Label>
                <Select name="species" required disabled={isPending}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="breed">Raça (aproximada)</Label>
                <Input id="breed" name="breed" placeholder="Ex: Labrador, SRD..." disabled={isPending} />
              </div>

              <div>
                <Label htmlFor="color">Cor</Label>
                <Input id="color" name="color" placeholder="Ex: Marrom, Preto..." disabled={isPending} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Porte</Label>
                <Select name="size" disabled={isPending}>
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
                <Label htmlFor="gender">Sexo</Label>
                <Select name="gender" disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <LocationSelector
              selectedState={selectedState}
              selectedCity={selectedCity}
              onStateChange={setSelectedState}
              onCityChange={setSelectedCity}
              required
              disabled={isPending}
            />

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Descreva onde e quando encontrou o pet, estado de saúde, comportamento..."
                rows={4}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="contact">WhatsApp para Contato *</Label>
              <Input
                id="contact"
                name="contact"
                type="tel"
                required
                placeholder="(11) 99999-9999"
                disabled={isPending}
              />
            </div>

            <ImageUploadManager images={images} onImagesChange={setImages} maxImages={5} disabled={isPending} />

            <Button type="submit" className="w-full" disabled={isPending || !selectedState || !selectedCity}>
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Pet Encontrado"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
