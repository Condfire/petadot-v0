import type {
  PetFormUI,
  PetFormDB,
  OngFormUI,
  OngFormDB,
  PartnerFormUI,
  PartnerFormDB,
  EventFormUI,
  EventFormDB,
  StoryFormUI,
  StoryFormDB,
  UserProfileUI,
  UserProfileDB,
} from "./types"
import { generateSlug, mapPetSpecies, mapPetSize, mapPetGender } from "./utils" // Importar também as funções de mapeamento de pet de utils

// Mapeamento de UI para DB para Pets
export function mapPetUIToDB(uiData: PetFormUI): PetFormDB {
  const {
    name,
    species,
    breed,
    color,
    size,
    gender,
    status,
    description,
    whatsapp_contact,
    image_urls,
    city,
    state,
    special_needs,
    resolved_at,
    resolved_by_user_id,
    resolution_details,
    rejection_reason,
  } = uiData

  return {
    name,
    species,
    breed,
    color,
    size,
    gender,
    status,
    description,
    whatsapp_contact,
    image_urls,
    city,
    state,
    special_needs: special_needs || null, // Ensure it's null if empty
    slug: generateSlug(`${name}-${city}-${state}-${species}`), // Auto-generate slug
    resolved_at: resolved_at || null,
    resolved_by_user_id: resolved_by_user_id || null,
    resolution_details: resolution_details || null,
    rejection_reason: rejection_reason || null,
  }
}

// Mapeamento de DB para UI para Pets (se necessário para edição)
// Exemplo:
// export function mapPetDBToUI(dbData: PetFormDB): PetFormUI { ... }

// Mapeamento de UI para DB para ONGs
export function mapOngUIToDB(uiData: OngFormUI): OngFormDB {
  const {
    name,
    description,
    email,
    contact_email,
    contact_phone,
    address,
    city,
    state,
    postal_code,
    website,
    social_media,
    logo_url,
    cnpj,
  } = uiData
  return {
    name,
    description,
    email,
    contact_email,
    contact_phone,
    address,
    city,
    state,
    postal_code,
    website,
    social_media,
    logo_url,
    cnpj,
    slug: generateSlug(name), // Auto-generate slug for ONG
  }
}

// Mapeamento de UI para DB para Partners
export function mapPartnerUIToDB(uiData: PartnerFormUI): PartnerFormDB {
  const { name, description, website, logo_url, contact_email, contact_phone } = uiData
  return {
    name,
    description,
    website,
    logo_url,
    contact_email,
    contact_phone,
    slug: generateSlug(name), // Auto-generate slug for Partner
  }
}

// Mapeamento de UI para DB para Events
export function mapEventUIToDB(uiData: EventFormUI): EventFormDB {
  const {
    name,
    description,
    start_date_ui,
    start_time_ui,
    end_date_ui,
    location,
    address,
    city,
    state,
    postal_code,
    image_url,
    contact_email,
    contact_phone,
    event_type,
    registration_url,
    registration_required,
    max_participants,
    is_featured,
  } = uiData

  // Validação e combinação de data e hora de início
  if (!start_date_ui) {
    throw new Error("A data de início do evento é obrigatória.")
  }
  if (!start_time_ui) {
    throw new Error("O horário de início do evento é obrigatório.")
  }

  const startDateTimeString = `${start_date_ui}T${start_time_ui}:00`
  const start_date = new Date(startDateTimeString)

  if (isNaN(start_date.getTime())) {
    throw new Error(`Formato de data/hora de início inválido: ${startDateTimeString}`)
  }

  // Combinação de data de término (opcional)
  let end_date: Date | null = null
  if (end_date_ui) {
    // Se end_date_ui existe, mas end_time_ui não, assume 23:59:59 do dia
    const endDateTimeString = `${end_date_ui}T23:59:59`
    const parsedEndDate = new Date(endDateTimeString)
    if (isNaN(parsedEndDate.getTime())) {
      throw new Error(`Formato de data de término inválido: ${end_date_ui}`)
    }
    end_date = parsedEndDate
  }

  return {
    name,
    description,
    image_url,
    location,
    address: address || null,
    city: city || null,
    state: state || null,
    postal_code: postal_code || null,
    country: "Brasil", // Default para Brasil
    registration_url: registration_url || null,
    registration_required: registration_required || false,
    max_participants: max_participants || null,
    is_featured: is_featured || false,
    slug: generateSlug(`${name}-${city || ""}-${state || ""}`), // Gerar slug
    status: "approved", // Publicado automaticamente sem moderação
    start_date,
    end_date,
    latitude: null, // Preencher se tivermos integração de geolocalização
    longitude: null, // Preencher se tivermos integração de geolocalização
    contact_email: contact_email || null,
    contact_phone: contact_phone || null,
    event_type: event_type || "other",
  }
}

// Mapeamento de DB para UI para Events (se necessário para edição)
export function mapEventDBToUI(dbData: EventFormDB): EventFormUI {
  const start_date_ui = dbData.start_date ? dbData.start_date.toISOString().split("T")[0] : ""
  const start_time_ui = dbData.start_date ? dbData.start_date.toTimeString().split(" ")[0].substring(0, 5) : ""
  const end_date_ui = dbData.end_date ? dbData.end_date.toISOString().split("T")[0] : ""

  return {
    name: dbData.name,
    description: dbData.description || "",
    start_date_ui,
    start_time_ui,
    end_date_ui,
    location: dbData.location || "",
    address: dbData.address || "",
    city: dbData.city || "",
    state: dbData.state || "",
    postal_code: dbData.postal_code || "",
    image_url: dbData.image_url || "",
    contact_email: dbData.contact_email || "",
    contact_phone: dbData.contact_phone || "",
    event_type: dbData.event_type || "other",
    registration_url: dbData.registration_url || "",
    registration_required: dbData.registration_required || false,
    max_participants: dbData.max_participants || undefined,
    is_featured: dbData.is_featured || false,
  }
}

// Mapeamento de UI para DB para Histórias de Sucesso
export function mapStoryUIToDB(uiData: StoryFormUI): StoryFormDB {
  const { title, content, image_url, pet_id, user_id, category } = uiData
  return {
    title,
    content,
    image_url,
    pet_id: pet_id || null,
    user_id: user_id || null,
    category: category || "geral",
    slug: generateSlug(title),
    status: "pending", // Default status
  }
}

// Mapeamento de DB para UI para Histórias de Sucesso
export function mapStoryDBToUI(dbData: StoryFormDB): StoryFormUI {
  return {
    title: dbData.title,
    content: dbData.content,
    image_url: dbData.image_url || "",
    pet_id: dbData.pet_id || "",
    user_id: dbData.user_id || "",
    category: dbData.category || "geral",
  }
}

// Mapeamento de UI para DB para UserProfile
export function mapUserProfileUIToDB(uiData: UserProfileUI): UserProfileDB {
  const { name, email, phone, address, city, state, postal_code, avatar_url } = uiData
  return {
    name,
    email,
    phone: phone || null,
    address: address || null,
    city: city || null,
    state: state || null,
    postal_code: postal_code || null,
    avatar_url: avatar_url || null,
  }
}

// Re-exportar as funções de mapeamento de pet de lib/utils para satisfazer o ambiente de deployment
export { mapPetSpecies, mapPetSize, mapPetGender }
