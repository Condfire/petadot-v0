import { z } from "zod"

export const speciesEnum = z.enum(["dog", "cat", "bird", "other"])
export type SpeciesEnum = z.infer<typeof speciesEnum>

export const petSizeEnum = z.enum(["small", "medium", "large", "other"])
export type PetSizeEnum = z.infer<typeof petSizeEnum>

export const animalSchema = z.object({
  name: z.string().optional(),
  species: speciesEnum,
  species_other: z.string().optional(),
  breed: z.string().optional(),
  age: z.string().optional(),
  petSize: petSizeEnum,
  size_other: z.string().optional(),
  gender: z.enum(["male", "female", "unknown", "other"]),
  gender_other: z.string().optional(),
  color: z.string(),
  color_other: z.string().optional(),
  description: z.string().optional(),
  found_date: z.string(), // Assuming YYYY-MM-DD format
  found_location: z.string(),
  current_location: z.string().optional(),
  contact: z.string(),
  main_image_url: z.string().url().optional(), // Changed from image_url to main_image_url
  images: z.array(z.string().url()).optional(), // Added for multiple images
  is_special_needs: z.boolean().optional(),
  special_needs_description: z.string().optional(),
  good_with_kids: z.boolean().optional(),
  good_with_cats: z.boolean().optional(),
  good_with_dogs: z.boolean().optional(),
  is_vaccinated: z.boolean().optional(),
  is_neutered: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected", "resolved"]).default("pending"),
  user_id: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  category: z.enum(["lost", "found", "adoption"]).default("found"),
  rejection_reason: z.string().optional(),
})

export type AnimalSchemaType = z.infer<typeof animalSchema>
