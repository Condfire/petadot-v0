import { z } from "zod"

export const speciesEnum = z.enum(["dog", "cat", "bird", "other"])
export type SpeciesEnum = z.infer<typeof speciesEnum>

export const petSizeEnum = z.enum(["small", "medium", "large", "other"])
export type PetSizeEnum = z.infer<typeof petSizeEnum>

export const animalSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  species: speciesEnum,
  species_other: z.string().max(255).optional(),
  breed: z.string().max(255).optional(),
  age: z.string().max(255).optional(),
  petSize: petSizeEnum,
  size_other: z.string().max(255).optional(),
  gender: z.enum(["male", "female", "unknown", "other"]),
  gender_other: z.string().max(255).optional(),
  color: z.string().max(255),
  color_other: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  found_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(), // YYYY-MM-DD
  found_location: z.string().max(255).optional(),
  current_location: z.string().max(255).optional(),
  contact: z.string().max(255),
  image_url: z.string().url().optional(), // Assuming single image for now
  is_special_needs: z.boolean().optional(),
  special_needs_description: z.string().max(500).optional(),
  good_with_kids: z.boolean().optional(),
  good_with_cats: z.boolean().optional(),
  good_with_dogs: z.boolean().optional(),
  is_vaccinated: z.boolean().optional(),
  is_neutered: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected", "adopted", "reunited"]).optional(),
  user_id: z.string().uuid().optional(),
  state: z.string().max(255).optional(),
  city: z.string().max(255).optional(),
  category: z.enum(["lost", "found", "adoption"]).optional(),
  rejection_reason: z.string().max(500).optional(),
  slug: z.string().max(255).optional(),
  main_image_url: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
})

export type AnimalSchemaType = z.infer<typeof animalSchema>
