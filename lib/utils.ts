import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar datas (ex: DD/MM/YYYY)
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Função para formatar data e hora (ex: DD/MM/YYYY HH:MM)
export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Use 24-hour format
  }).format(date)
}

// Função para formatar valores monetários (ex: R$ 1.234,56)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Mapeamento de status de pet para texto legível
export const mapPetStatusToText = (status: string) => {
  switch (status) {
    case "lost":
      return "Perdido"
    case "found":
      return "Encontrado"
    case "for_adoption":
      return "Para Adoção"
    case "reunited":
      return "Reunido"
    case "adopted":
      return "Adotado"
    case "resolved":
      return "Resolvido"
    default:
      return status
  }
}

// Mapeamento de tipos de evento para texto legível
export const mapEventTypeToText = (type: string) => {
  switch (type) {
    case "adoption_fair":
      return "Feira de Adoção"
    case "fundraiser":
      return "Arrecadação de Fundos"
    case "workshop":
      return "Workshop"
    case "other":
      return "Outro"
    default:
      return type
  }
}
