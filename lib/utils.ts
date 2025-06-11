import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * Gera um slug a partir de uma string.
 * @param text A string para gerar o slug.
 * @returns O slug gerado.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}
