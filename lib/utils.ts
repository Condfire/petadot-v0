import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Mappers - Camada de mapeamento entre a interface do usuário e o banco de dados
 *
 * Este arquivo contém funções para converter entre os formatos de dados usados na interface
 * do usuário e os formatos usados no banco de dados, garantindo consistência e facilitando
 * a manutenção.
 */

// Tipos para a interface do usuário
export type EventFormUI = {
  name: string // Changed from title to name
  description: string
  start_date_ui: string // Changed from event_date to start_date_ui
  start_time_ui: string // Changed from event_time to start_time_ui
  end_date_ui?: string // New field for end_date in UI
  location: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  image_url?: string
}

// Tipos para o banco de dados
export type EventDB = {
  name: string // Changed from title to name
  description: string
  start_date: string // Changed from date to start_date
  end_date?: string
  location: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  image_url?: string
  ong_id?: string
  user_id?: string
  status?: string
  created_at?: string
  updated_at?: string
}

/**
 * Converte um evento do formato da UI para o formato do banco de dados
 */
export function mapEventUIToDB(eventUI: EventFormUI, ongId?: string, userId?: string): EventDB {
  // Validar e formatar a data e hora do evento de início
  if (!eventUI.start_date_ui || !eventUI.start_time_ui) {
    throw new Error("Data de início e horário são obrigatórios.")
  }
  const startDateTime = `${eventUI.start_date_ui}T${eventUI.start_time_ui}:00`

  // Validar e formatar a data de término, se fornecida
  let endDateTime: string | undefined = undefined
  if (eventUI.end_date_ui) {
    // Assume end_date_ui is just a date, set time to end of day
    endDateTime = `${eventUI.end_date_ui}T23:59:59`
  }

  return {
    name: eventUI.name,
    description: eventUI.description,
    start_date: startDateTime,
    end_date: endDateTime,
    location: eventUI.location,
    address: eventUI.address,
    city: eventUI.city,
    state: eventUI.state,
    postal_code: eventUI.postal_code,
    image_url: eventUI.image_url,
    ong_id: ongId,
    user_id: userId,
  }
}

/**
 * Converte um evento do formato do banco de dados para o formato da UI
 */
export function mapEventDBToUI(eventDB: EventDB): EventFormUI {
  // Extrair data e hora do campo start_date
  const startDateObj = new Date(eventDB.start_date)
  const start_date_ui = startDateObj.toISOString().split("T")[0]
  const start_time_ui = startDateObj.toTimeString().slice(0, 5)

  // Extrair data de término, se existir
  const end_date_ui = eventDB.end_date ? new Date(eventDB.end_date).toISOString().split("T")[0] : undefined

  return {
    name: eventDB.name,
    description: eventDB.description,
    start_date_ui,
    start_time_ui,
    end_date_ui,
    location: eventDB.location,
    address: eventDB.address,
    city: eventDB.city,
    state: eventDB.state,
    postal_code: eventDB.postal_code,
    image_url: eventDB.image_url,
  }
}

// Tipos para pets
export type PetFormUI = {
  name: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description: string
  is_castrated: boolean
  is_vaccinated: boolean
  is_special_needs: boolean
  special_needs_description?: string
  image_url: string
}

export type PetDB = {
  name: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description: string
  is_castrated: boolean
  is_vaccinated: boolean
  is_special_needs: boolean
  special_needs_description?: string
  image_url: string
  ong_id?: string
  user_id?: string
  status?: string
}

/**
 * Converte um pet do formato da UI para o formato do banco de dados
 */
export function mapPetUIToDB(petUI: PetFormUI, ongId?: string, userId?: string): PetDB {
  return {
    ...petUI,
    ong_id: ongId,
    user_id: userId,
  }
}

/**
 * Converte um pet do formato do banco de dados para o formato da UI
 */
export function mapPetDBToUI(petDB: PetDB): PetFormUI {
  return {
    name: petDB.name,
    species: petDB.species,
    species_other: petDB.species_other,
    breed: petDB.breed,
    age: petDB.age,
    size: petDB.size,
    size_other: petDB.size_other,
    gender: petDB.gender,
    gender_other: petDB.gender_other,
    color: petDB.color,
    color_other: petDB.color_other,
    description: petDB.description,
    is_castrated: petDB.is_castrated,
    is_vaccinated: petDB.is_vaccinated,
    is_special_needs: petDB.is_special_needs,
    special_needs_description: petDB.special_needs_description,
    image_url: petDB.image_url,
  }
}

// Tipos para pets perdidos
export type LostPetFormUI = {
  name?: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description?: string
  last_seen_date: string
  last_seen_location: string
  contact: string
  image_url: string
  state?: string
  city?: string
  is_special_needs?: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  is_vaccinated?: boolean
  is_neutered?: boolean
}

export type LostPetDB = {
  name?: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description?: string
  last_seen_date: string
  last_seen_location: string
  contact: string
  image_url: string
  user_id?: string
  status?: string
  state?: string
  city?: string
  is_special_needs?: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  is_vaccinated?: boolean
  is_neutered?: boolean
}

/**
 * Converte um pet perdido do formato da UI para o formato do banco de dados
 */
export function mapLostPetUIToDB(petUI: LostPetFormUI, userId?: string): LostPetDB {
  return {
    ...petUI,
    user_id: userId,
  }
}

/**
 * Converte um pet perdido do formato do banco de dados para o formato da UI
 */
export function mapLostPetDBToUI(petDB: LostPetDB): LostPetFormUI {
  return {
    name: petDB.name,
    species: petDB.species,
    species_other: petDB.species_other,
    breed: petDB.breed,
    age: petDB.age,
    size: petDB.size,
    size_other: petDB.size_other,
    gender: petDB.gender,
    gender_other: petDB.gender_other,
    color: petDB.color,
    color_other: petDB.color_other,
    description: petDB.description,
    last_seen_date: petDB.last_seen_date,
    last_seen_location: petDB.last_seen_location,
    contact: petDB.contact,
    image_url: petDB.image_url,
    state: petDB.state,
    city: petDB.city,
    is_special_needs: petDB.is_special_needs,
    special_needs_description: petDB.special_needs_description,
    good_with_kids: petDB.good_with_kids,
    good_with_cats: petDB.good_with_cats,
    good_with_dogs: petDB.good_with_dogs,
    is_vaccinated: petDB.is_vaccinated,
    is_neutered: petDB.is_neutered,
  }
}

// Tipos para pets encontrados
export type FoundPetFormUI = {
  name?: string
  species: string
  species_other?: string
  breed?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description?: string
  found_date: string
  found_location: string
  current_location?: string
  contact: string
  image_url: string
  state?: string
  city?: string
  is_special_needs?: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  is_vaccinated?: boolean
  is_neutered?: boolean
}

export type FoundPetDB = {
  name?: string
  species: string
  species_other?: string
  breed?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  color?: string
  color_other?: string
  description?: string
  found_date: string
  found_location: string
  current_location?: string
  contact: string
  image_url: string
  user_id?: string
  status?: string
  state?: string
  city?: string
  is_special_needs?: boolean
  special_needs_description?: string
  good_with_kids?: boolean
  good_with_cats?: boolean
  good_with_dogs?: boolean
  is_vaccinated?: boolean
  is_neutered?: boolean
}

/**
 * Converte um pet encontrado do formato da UI para o formato do banco de dados
 */
export function mapFoundPetUIToDB(petUI: FoundPetFormUI, userId?: string): FoundPetDB {
  return {
    ...petUI,
    user_id: userId,
  }
}

/**
 * Converte um pet encontrado do formato do banco de dados para o formato da UI
 */
export function mapFoundPetDBToUI(petDB: FoundPetDB): FoundPetFormUI {
  return {
    name: petDB.name,
    species: petDB.species,
    species_other: petDB.species_other,
    breed: petDB.breed,
    size: petDB.size,
    size_other: petDB.size_other,
    gender: petDB.gender,
    gender_other: petDB.gender_other,
    color: petDB.color,
    color_other: petDB.color_other,
    description: petDB.description,
    found_date: petDB.found_date,
    found_location: petDB.found_location,
    current_location: petDB.current_location,
    contact: petDB.contact,
    image_url: petDB.image_url,
    state: petDB.state,
    city: petDB.city,
    is_special_needs: petDB.is_special_needs,
    special_needs_description: petDB.special_needs_description,
    good_with_kids: petDB.good_with_kids,
    good_with_cats: petDB.good_with_cats,
    good_with_dogs: petDB.good_with_dogs,
    is_vaccinated: petDB.is_vaccinated,
    is_neutered: petDB.is_neutered,
  }
}

/**
 * Mapeia o status de um pet para um texto legível
 * @param status Status do pet
 * @returns Texto legível do status
 */
export function mapPetStatus(status: string | null | undefined): string {
  if (!status) return "Desconhecido"

  const statusMap: Record<string, string> = {
    approved: "Aprovado",
    pending: "Pendente",
    rejected: "Rejeitado",
    adopted: "Adotado",
    resolved: "Resolvido",
    reunited: "Reunido",
    available: "Disponível",
  }

  return statusMap[status] || status
}

/**
 * Mapeia a espécie de um pet para um texto legível
 * @param species Espécie do pet
 * @param speciesOther Valor personalizado para "other"
 * @returns Texto legível da espécie
 */
export function mapPetSpecies(species: string | null | undefined, speciesOther?: string | null): string {
  if (!species) return "Outro"

  // Se for "other" e tiver um valor personalizado, retornar o valor personalizado
  if (species === "other" && speciesOther) {
    return speciesOther
  }

  const speciesMap: Record<string, string> = {
    dog: "Cachorro",
    cat: "Gato",
    bird: "Pássaro",
    rabbit: "Coelho",
    hamster: "Hamster",
    fish: "Peixe",
    turtle: "Tartaruga",
    other: "Outro",
  }

  return speciesMap[species] || species
}

/**
 * Mapeia o tamanho de um pet para um texto legível
 * @param size Tamanho do pet
 * @param sizeOther Valor personalizado para "other"
 * @returns Texto legível do tamanho
 */
export function mapPetSize(size: string | null | undefined, sizeOther?: string | null): string {
  if (!size) return "Não informado"

  // Se for "other" e tiver um valor personalizado, retornar o valor personalizado
  if (size === "other" && sizeOther) {
    return sizeOther
  }

  const sizeMap: Record<string, string> = {
    small: "Pequeno",
    medium: "Médio",
    large: "Grande",
    giant: "Gigante",
  }

  return sizeMap[size] || size
}

/**
 * Mapeia a idade de um pet para um texto legível
 * @param age Idade do pet
 * @returns Texto legível da idade
 */
export function mapPetAge(age: string | null | undefined): string {
  if (!age) return "Não informada"

  const ageMap: Record<string, string> = {
    baby: "Filhote",
    young: "Jovem",
    adult: "Adulto",
    senior: "Idoso",
  }

  return ageMap[age] || age
}

/**
 * Mapeia o gênero de um pet para um texto legível
 * @param gender Gênero do pet
 * @param genderOther Valor personalizado para "other"
 * @returns Texto legível do gênero
 */
export function mapPetGender(gender: string | null | undefined, genderOther?: string | null): string {
  if (!gender) return "Não informado"

  // Se for "other" e tiver um valor personalizado, retornar o valor personalizado
  if (gender === "other" && genderOther) {
    return genderOther
  }

  const genderMap: Record<string, string> = {
    male: "Macho",
    female: "Fêmea",
    unknown: "Não informado",
    other: "Outro",
  }

  return genderMap[gender] || gender
}

/**
 * Mapeia a cor de um pet para um texto legível
 * @param color Cor do pet
 * @param colorOther Valor personalizado para "other"
 * @returns Texto legível da cor
 */
export function mapPetColor(color: string | null | undefined, colorOther?: string | null): string {
  if (!color) return "Não informada"

  // Se for "other" e tiver um valor personalizado, retornar o valor personalizado
  if (color === "other" && colorOther) {
    return colorOther
  }

  const colorMap: Record<string, string> = {
    black: "Preto",
    white: "Branco",
    brown: "Marrom",
    gray: "Cinza",
    golden: "Dourado",
    spotted: "Malhado",
    tricolor: "Tricolor",
    other: "Outra",
  }

  return colorMap[color] || color
}

/**
 * Mapeia a categoria de uma história para um texto legível
 * @param category Categoria da história
 * @returns Texto legível da categoria
 */
export function mapStoryCategory(category: string | null | undefined): string {
  if (!category) return "Outras"

  const categoryMap: Record<string, string> = {
    adoption: "Adoção",
    rescue: "Resgate",
    reunion: "Reencontro",
    transformation: "Transformação",
    special_needs: "Necessidades Especiais",
    senior: "Pet Idoso",
    volunteer: "Voluntariado",
    other: "Outras",
  }

  return categoryMap[category] || category
}

/**
 * Mapeia o status de uma história para um texto legível
 * @param status Status da história
 * @returns Texto legível do status
 */
export function mapStoryStatus(status: string | null | undefined): string {
  if (!status) return "Desconhecido"

  const statusMap: Record<string, string> = {
    aprovado: "Aprovado",
    pendente: "Pendente",
    rejeitado: "Rejeitado",
  }

  return statusMap[status] || status
}

/**
 * Mapeia o tipo de evento para um texto legível
 * @param type Tipo do evento
 * @returns Texto legível do tipo
 */
export function mapEventType(type: string | null | undefined): string {
  if (!type) return "Outro"

  const typeMap: Record<string, string> = {
    adoption_fair: "Feira de Adoção",
    fundraising: "Arrecadação de Fundos",
    vaccination: "Campanha de Vacinação",
    educational: "Evento Educativo",
    volunteer: "Voluntariado",
    other: "Outro",
  }

  return typeMap[type] || type
}

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada
 * @returns Data formatada
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Data não informada"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return "Data inválida"
  }
}

/**
 * Formata uma data e hora para exibição
 * @param date Data e hora a ser formatada
 * @returns Data e hora formatada
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "Data não informada"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Erro ao formatar data e hora:", error)
    return "Data inválida"
  }
}

/**
 * Formata um número para exibição como moeda
 * @param value Valor a ser formatado
 * @returns Valor formatado como moeda
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00"

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
