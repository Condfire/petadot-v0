export type PetType = "adoption" | "lost" | "found"

/**
 * Dados utilizados nos formulários de cadastro e edição de pets.
 *
 * Esta interface agrega todos os campos manipulados pelo componente
 * `AdoptionPetForm` e pela função `createAdoptionPet`. Nem todos os campos
 * são obrigatórios em todos os contextos, por isso muitos são opcionais.
 */
export interface PetFormUI {
  id?: string
  slug?: string
  is_editing?: boolean

  /** Informações básicas */
  name: string
  species: string
  species_other?: string | null
  breed?: string
  age?: string
  size: string
  size_other?: string | null
  gender: string
  gender_other?: string | null
  color: string
  color_other?: string | null
  description: string

  /** Imagens */
  image_url?: string
  image_urls?: string[]

  /** Estado de saúde e comportamentos */
  is_vaccinated?: boolean
  is_castrated?: boolean
  is_neutered?: boolean
  is_special_needs?: boolean
  special_needs?: string
  special_needs_description?: string | null
  temperament?: string | null
  energy_level?: string | null
  sociability?: string
  shedding?: string
  trainability?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean

  /** Localização e contato */
  location?: string
  city: string
  state: string
  contact?: string
  whatsapp_contact?: string

  /** Relacionamentos */
  ong_id?: string | null
  user_id?: string

  /** Status internos */
  status?: string
}
