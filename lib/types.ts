export type PetType = "adoption" | "lost" | "found"

/**
 * Dados utilizados nos formulários de cadastro e edição de pets.
 *
 * Esta interface agrega todos os campos manipulados pelo componente
 * `AdoptionPetForm` e pela função `createAdoptionPet`. Nem todos os campos
 * são obrigatórios em todos os contextos, por isso muitos são opcionais.
 */
export type PetFormUI = {
  id?: string
  name: string
  species: string
  species_other?: string | null
  breed: string
  age: string
  size: string
  size_other?: string | null
  gender: string
  gender_other?: string | null
  color: string
  color_other?: string | null
  description: string
  main_image_url?: string | null
  is_vaccinated?: boolean
  is_castrated?: boolean
  is_special_needs?: boolean
  special_needs_description?: string | null
  temperament?: string | null
  energy_level?: string | null
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  city: string
  state: string
  contact: string
  ong_id?: string | null
  is_editing?: boolean
  slug?: string | null
  // Campos específicos para pets perdidos/encontrados, se necessário
  last_seen_date?: string | null
  last_seen_location?: string | null
  found_date?: string | null
  found_location?: string | null
  current_location?: string | null
}
