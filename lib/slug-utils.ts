/**
 * Utilitários para geração e manipulação de slugs
 */

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

/**
 * Normaliza um texto para formato de slug
 * @param text Texto a ser normalizado
 * @returns Texto normalizado em formato de slug
 */
export function normalizeText(text: string): string {
  if (!text) return ""

  // Normalizar o texto (remover acentos)
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remover caracteres especiais
    .replace(/\s+/g, "-") // Substituir espaços por hífens
    .replace(/-+/g, "-") // Remover hífens duplicados
    .trim()

  return normalized
}

/**
 * Verifica se uma string é um UUID válido
 * @param str String a ser verificada
 * @returns Verdadeiro se for um UUID válido
 */
export function isUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Extrai os primeiros caracteres de um UUID
 * @param uuid UUID completo
 * @param length Número de caracteres a extrair (padrão: 5)
 * @returns Parte inicial do UUID
 */
export function getUuidPrefix(uuid: string, length = 5): string {
  if (!uuid || !isUuid(uuid)) return ""
  return uuid.replace(/-/g, "").slice(0, length)
}

/**
 * Gera um slug para pet (perdido, encontrado ou adoção)
 * @param name Nome do pet
 * @param type Tipo do pet (perdido, encontrado, adoção)
 * @param city Cidade
 * @param state Estado
 * @param uuid UUID do registro
 * @returns Slug gerado
 */
export async function generatePetSlug(
  name: string,
  type: string,
  city: string,
  state: string,
  uuid: string,
  table: string,
): Promise<string> {
  const normalizedName = normalizeText(name || "pet")
  const normalizedType = normalizeText(type || "desconhecido")
  const normalizedCity = normalizeText(city || "")
  const normalizedState = normalizeText(state || "")
  const year = new Date().getFullYear()
  const uuidPrefix = getUuidPrefix(uuid)

  let slug = `${normalizedName}-${normalizedType}`

  if (normalizedCity) {
    slug += `-${normalizedCity}`
  }

  if (normalizedState) {
    slug += `-${normalizedState}`
  }

  slug += `-${year}-${uuidPrefix}`

  return slug
}

/**
 * Gera um slug para ONG
 * @param name Nome da ONG
 * @param city Cidade
 * @param state Estado
 * @param uuid UUID do registro
 * @returns Slug gerado
 */
export async function generateOngSlug(name: string, city: string, state: string, uuid: string): Promise<string> {
  const normalizedName = normalizeText(name || "ong")
  const normalizedCity = normalizeText(city || "")
  const normalizedState = normalizeText(state || "")
  const uuidPrefix = getUuidPrefix(uuid)

  let slug = `${normalizedName}`

  if (normalizedCity) {
    slug += `-${normalizedCity}`
  }

  if (normalizedState) {
    slug += `-${normalizedState}`
  }

  if (uuidPrefix) {
    slug += `-${uuidPrefix}`
  }

  return slug
}

/**
 * Gera um slug para parceiro
 * @param name Nome do parceiro
 * @param city Cidade
 * @param state Estado
 * @param uuid UUID do registro
 * @returns Slug gerado
 */
export async function generatePartnerSlug(name: string, city: string, state: string, uuid: string): Promise<string> {
  const normalizedName = normalizeText(name || "parceiro")
  const normalizedCity = normalizeText(city || "")
  const normalizedState = normalizeText(state || "")
  const uuidPrefix = getUuidPrefix(uuid)

  let slug = `${normalizedName}`

  if (normalizedCity) {
    slug += `-${normalizedCity}`
  }

  if (normalizedState) {
    slug += `-${normalizedState}`
  }

  if (uuidPrefix) {
    slug += `-${uuidPrefix}`
  }

  return slug
}

/**
 * Gera um slug para evento
 * @param title Título do evento
 * @param location Local do evento
 * @param date Data do evento
 * @param uuid UUID do registro
 * @returns Slug gerado
 */
export async function generateEventSlug(title: string, location: string, date: string, uuid: string): Promise<string> {
  const normalizedTitle = normalizeText(title || "evento")
  const normalizedLocation = normalizeText(location || "")
  const uuidPrefix = getUuidPrefix(uuid)

  let slug = `${normalizedTitle}`

  if (normalizedLocation) {
    slug += `-${normalizedLocation}`
  }

  // Adicionar data formatada (dia-mes-ano)
  if (date) {
    try {
      const eventDate = new Date(date)
      const day = eventDate.getDate().toString().padStart(2, "0")
      const month = (eventDate.getMonth() + 1).toString().padStart(2, "0")
      const year = eventDate.getFullYear()

      slug += `-${day}-${month}-${year}`
    } catch (error) {
      console.error("Erro ao formatar data para slug:", error)
    }
  }

  if (uuidPrefix) {
    slug += `-${uuidPrefix}`
  }

  return slug
}

/**
 * Gera um slug a partir de um texto
 * @param text Texto a ser convertido em slug
 * @returns Slug gerado
 */
export function generateSlug(name: string, city: string, state: string): string {
  const cleanName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()

  const cleanCity = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  const cleanState = state.toLowerCase()

  // Generate unique identifier
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 5)

  return `${cleanName}-${cleanCity}-${cleanState}-${timestamp}${random}`
}

/**
 * Verifica se um slug já existe no banco de dados
 * @param slug Slug a ser verificado
 * @param table Nome da tabela
 * @param excludeId ID a ser excluído da verificação (para atualizações)
 * @returns Verdadeiro se o slug já existir
 */
export async function slugExists(slug: string, table: string, excludeId?: string): Promise<boolean> {
  const supabase = createServerComponentClient({ cookies })

  let query = supabase.from(table).select("id").eq("slug", slug)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error(`Erro ao verificar slug em ${table}:`, error)
    return false
  }

  return !!data
}

/**
 * Gera um slug único para uma entidade
 * @param baseSlug Slug base
 * @param table Nome da tabela
 * @param excludeId ID a ser excluído da verificação (para atualizações)
 * @returns Slug único
 */
export async function generateUniqueSlug(baseSlug: string, table: string, excludeId?: string): Promise<string> {
  const supabase = createServerComponentClient({ cookies })

  let slug = baseSlug
  let counter = 1

  while (true) {
    let query = supabase.from(table).select("id").eq("slug", slug)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      // Slug is unique
      break
    }

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Função genérica para gerar slug para qualquer tipo de entidade
 * @param entityType Tipo de entidade (pet, ong, evento, parceiro)
 * @param data Dados da entidade
 * @param uuid UUID da entidade
 * @returns Slug gerado
 */
export async function generateEntitySlug(
  entityType: "pet" | "ong" | "evento" | "parceiro",
  data: { name: string; city: string; state: string },
  uuid: string,
): Promise<string> {
  switch (entityType) {
    case "pet":
      return generatePetSlug(
        data.name || data.nome,
        data.type || data.tipo,
        data.city || data.cidade,
        data.state || data.estado,
        uuid,
        "pets",
      )

    case "ong":
      return generateOngSlug(data.name || data.nome, data.city || data.cidade, data.state || data.estado, uuid)

    case "evento":
      return generateEventSlug(data.name || data.nome, data.city || data.cidade, data.state || data.estado, uuid)

    case "parceiro":
      return generatePartnerSlug(data.name || data.nome, data.city || data.cidade, data.state || data.estado, uuid)

    default:
      // Fallback para um slug genérico
      const name = data.name || data.nome || data.title || data.titulo || "item"
      const normalizedName = normalizeText(name)
      const uuidPrefix = getUuidPrefix(uuid)
      return `${normalizedName}-${uuidPrefix}`
  }
}
