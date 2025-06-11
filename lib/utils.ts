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
 * Mapeia o tipo de evento para uma string de exibição.
 * @param eventType O tipo de evento (e.g., "Feira de Adoção", "Campanha de Vacinação").
 * @returns A string formatada do tipo de evento.
 */
export function mapEventType(eventType: string | null | undefined): string {
  if (!eventType) return "Não especificado"

  switch (eventType.toLowerCase()) {
    case "feira de adoção":
      return "Feira de Adoção"
    case "campanha de vacinação":
      return "Campanha de Vacinação"
    case "arrecadação":
      return "Arrecadação"
    case "palestra":
      return "Palestra"
    case "workshop":
      return "Workshop"
    case "mutirão":
      return "Mutirão"
    default:
      return eventType
  }
}
