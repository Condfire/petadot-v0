"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  animalSchema,
  type AnimalSchemaType,
  petSizeEnum,
  PetSizeEnum,
  speciesEnum,
  SpeciesEnum,
} from "@/lib/validators/animal"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/utils"
import { ImageUpload } from "@/components/ImageUpload"
import { useUser } from "@supabase/auth-helpers-react"
import { useSupabaseClient } from "@/lib/supabase/client"

interface FoundPetFormProps {
  pet?: AnimalSchemaType
}

export function FoundPetForm({ pet: initialPet }: FoundPetFormProps) {
  const user = useUser()
  const supabase = useSupabaseClient()
  const [imageUrl, setImageUrl] = useState<string | null>(initialPet?.images?.[0] || null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<AnimalSchemaType>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: initialPet?.name || "",
      species: initialPet?.species || SpeciesEnum.DOG,
      breed: initialPet?.breed || "",
      age: initialPet?.age || "",
      petSize: initialPet?.petSize || PetSizeEnum.SMALL,
      location: initialPet?.location || "",
      description: initialPet?.description || "",
    },
  })

  async function onSubmit(data: AnimalSchemaType) {
    try {
      const generatedSlug = generateSlug(data.name)

      const newPet = {
        ...data,
        status: "pending", // Definindo o status como 'pending'
        user_id: user?.id, // Adicionando o user_id
        images: imageUrl ? [imageUrl] : [],
        slug: generatedSlug,
      }

      const { error } = await supabase.from("pets").insert([newPet])

      if (error) {
        console.error("Error creating pet:", error)
        toast({
          title: "Oh no! Something went wrong.",
          description: "There was an error creating your pet. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success!",
        description: "Your pet has been created.",
      })

      router.refresh()
      router.push(`/`)
    } catch (error) {
      console.error("Error creating pet:", error)
      toast({
        title: "Oh no! Something went wrong.",
        description: "There was an error creating your pet. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Species</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a species" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(speciesEnum).map((species) => (
                      <SelectItem key={species} value={species}>
                        {species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl>
                  <Input placeholder="Breed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input placeholder="Age" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="petSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(petSizeEnum).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Image</FormLabel>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            required
            folder="pets_found"
            userId={user?.id} // Passando o ID do usuário autenticado
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
