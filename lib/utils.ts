import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para exibição (apenas data)
 * @param dateInput Data a ser formatada
 * @returns Data formatada no formato DD/MM/AAAA
 */
export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Data não informada"
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleDateString("pt-BR", {
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
 * @param dateInput Data e hora a ser formatada
 * @returns Data e hora formatada no formato DD/MM/AAAA HH:MM:SS
 */
export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "Data não informada"
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.error("Erro ao formatar data e hora:", error)
    return "Data inválida"
  }
}
