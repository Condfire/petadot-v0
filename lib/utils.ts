import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Importar utilitários de data
export { formatDate, formatDateTime, formatRelativeTime, isValidDate } from "./date-utils"

// Função para formatar data (compatibilidade)
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
