"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationSelector } from "@/components/location-selector"
import { mapPetSpecies, mapPetSize, mapPetGender, mapPetColor, mapPetAge } from "@/lib/utils" // Importar de lib/utils
import { PetFormSchema, type PetFormSchemaType } from "@/lib/validators/animal"

interface PetFormProps {
  initialData?: PetFormSchemaType
  onSubmit: (data: PetFormSchemaType) => Promise<void>
  isLoading: boolean
  category: "lost" | "found" | "adoption"
}

// Exportação nomeada para quem usa import { PetForm } from '@/components/PetForm'
export function PetForm({ initialData, onSubmit, isLoading, category }: PetFormProps) {
  const form = useForm<PetFormSchemaType>({
    resolver: zodResolver(PetFormSchema),
    defaultValues: initialData || {
      name: "",
      species: "",
      other_species: "",
      breed: "",
      other_breed: "",
      age: "",
      size: "",
      gender: "",
      color: "",
      description: "",
      contact_whatsapp: "",
      image_urls: [],
      city: "",
      state: "",
      is_special_needs: false,
      status: category === "adoption" ? "available" : "approved",
      main_image_url: "",
      category: category,
    },
  })

  const selectedSpecies = form.watch("species")
  const selectedSize = form.watch("size")
  const selectedGender = form.watch("gender")
  const selectedColor = form.watch("color")
  const isSpecialNeeds = form.watch("is_special_needs")

  const handleImageUpload = (urls: string[]) => {
    form.setValue("image_urls", urls, { shouldValidate: true })
  }

  const handleLocationChange = (city: string, state: string) => {
    form.setValue("city", city, { shouldValidate: true })
    form.setValue("state", state, { shouldValidate: true })
  }

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Pet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Marley" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espécie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dog">{mapPetSpecies("dog")}</SelectItem>
                    <SelectItem value="cat">{mapPetSpecies("cat")}</SelectItem>
                    <SelectItem value="other">{mapPetSpecies("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedSpecies === "other" && (
            <FormField
              control={form.control}
              name="other_species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual outra espécie?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Furão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raça (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Golden Retriever" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a idade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baby">{mapPetAge("baby")}</SelectItem>
                    <SelectItem value="young">{mapPetAge("young")}</SelectItem>
                    <SelectItem value="adult">{mapPetAge("adult")}</SelectItem>
                    <SelectItem value="senior">{mapPetAge("senior")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porte</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="small">{mapPetSize("small")}</SelectItem>
                    <SelectItem value="medium">{mapPetSize("medium")}</SelectItem>
                    <SelectItem value="large">{mapPetSize("large")}</SelectItem>
                    <SelectItem value="giant">{mapPetSize("giant")}</SelectItem>
                    <SelectItem value="other">{mapPetSize("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedSize === "other" && (
            <FormField
              control={form.control}
              name="size_other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual outro porte?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Miniatura" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{mapPetGender("male")}</SelectItem>
                    <SelectItem value="female">{mapPetGender("female")}</SelectItem>
                    <SelectItem value="unknown">{mapPetGender("unknown")}</SelectItem>
                    <SelectItem value="other">{mapPetGender("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedGender === "other" && (
            <FormField
              control={form.control}
              name="gender_other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual outro gênero?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Não binário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="black">{mapPetColor("black")}</SelectItem>
                    <SelectItem value="white">{mapPetColor("white")}</SelectItem>
                    <SelectItem value="brown">{mapPetColor("brown")}</SelectItem>
                    <SelectItem value="gray">{mapPetColor("gray")}</SelectItem>
                    <SelectItem value="golden">{mapPetColor("golden")}</SelectItem>
                    <SelectItem value="spotted">{mapPetColor("spotted")}</SelectItem>
                    <SelectItem value="tricolor">{mapPetColor("tricolor")}</SelectItem>
                    <SelectItem value="other">{mapPetColor("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedColor === "other" && (
            <FormField
              control={form.control}
              name="color_other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual outra cor?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tigrado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Conte mais sobre o pet..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp para Contato</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 5511987654321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LocationSelector
          initialCity={initialData?.city}
          initialState={initialData?.state}
          onLocationChange={handleLocationChange}
        />
        {form.formState.errors.city && <FormMessage>{form.formState.errors.city.message}</FormMessage>}
        {form.formState.errors.state && <FormMessage>{form.formState.errors.state.message}</FormMessage>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Cadastrar Pet"}
        </Button>
      </form>
    </Form>
  )
}

// Exportação default para quem usa import PetForm from '@/components/PetForm'
export default PetForm
