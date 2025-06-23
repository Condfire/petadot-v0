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
  // CORREÇÃO: Usar main_image_url em vez de image_urls (array)
  main_image_url?: string | null // Alterado de image_urls: string[]
  is_vaccinated?: boolean
  is_castrated?: boolean // Mapeia para is_neutered no DB
  is_special_needs?: boolean
  special_needs_description?: string | null
  temperament?: string | null
  energy_level?: string | null
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  city: string
  state: string
  whatsapp_contact: string // Mapeia para contact no DB
  ong_id?: string | null
  is_editing?: boolean // Para indicar se é uma edição
  slug?: string | null // Adicionado para edição
  // Campos específicos para pets perdidos/encontrados, se necessário
  last_seen_date?: string | null
  last_seen_location?: string | null
  found_date?: string | null
  found_location?: string | null
  current_location?: string | null
}
