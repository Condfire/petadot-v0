import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * @param inputs Classes CSS a serem combinadas
 * @returns Classes CSS combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada
 * @param includeTime Incluir hora na formatação
 * @returns Data formatada
 */
export function formatDate(date: Date | string, includeTime = false) {
  const d = typeof date === "string" ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return "Data inválida"
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }

  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }

  return d.toLocaleDateString("pt-BR", options)
}

/**
 * Trunca um texto para um tamanho máximo
 * @param text Texto a ser truncado
 * @param maxLength Tamanho máximo do texto
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Gera um slug a partir de um texto
 * @param text Texto a ser convertido em slug
 * @returns Slug gerado
 */
export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

/**
 * Formata um número para exibição como moeda
 * @param value Valor a ser formatado
 * @returns Valor formatado como moeda
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Gera um ID único
 * @returns ID único
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Verifica se um valor é um objeto
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for um objeto, falso caso contrário
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

/**
 * Verifica se um valor é uma string vazia
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for uma string vazia, falso caso contrário
 */
export function isEmptyString(value: any): boolean {
  return typeof value === "string" && value.trim() === ""
}

/**
 * Verifica se um valor é nulo ou indefinido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for nulo ou indefinido, falso caso contrário
 */
export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined
}

/**
 * Verifica se um valor é um array vazio
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for um array vazio, falso caso contrário
 */
export function isEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length === 0
}

/**
 * Verifica se um valor é um objeto vazio
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for um objeto vazio, falso caso contrário
 */
export function isEmptyObject(value: any): boolean {
  return isObject(value) && Object.keys(value).length === 0
}

/**
 * Verifica se um valor é vazio (nulo, indefinido, string vazia, array vazio ou objeto vazio)
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor for vazio, falso caso contrário
 */
export function isEmpty(value: any): boolean {
  return (
    isNullOrUndefined(value) ||
    isEmptyString(value) ||
    isEmptyArray(value) ||
    isEmptyObject(value) ||
    value === false ||
    value === 0
  )
}

/**
 * Verifica se um valor não é vazio
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor não for vazio, falso caso contrário
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

/**
 * Obtém o valor de um objeto aninhado usando uma string de caminho
 * @param obj Objeto a ser acessado
 * @param path Caminho para o valor
 * @param defaultValue Valor padrão caso o caminho não exista
 * @returns Valor encontrado ou valor padrão
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined) {
  const keys = path.split(".")
  let result = obj

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}
