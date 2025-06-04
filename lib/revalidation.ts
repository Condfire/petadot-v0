"use server"

import { revalidatePath } from "next/cache"

/**
 * Revalida uma página específica
 * @param path Caminho da página a ser revalidada
 */
export async function revalidateSpecificPath(path: string) {
  revalidatePath(path)
  return { success: true, message: `Página ${path} revalidada com sucesso` }
}

/**
 * Revalida todas as páginas principais
 */
export async function revalidateMainPages() {
  // Revalidar página inicial
  revalidatePath("/")

  // Revalidar páginas de listagem
  revalidatePath("/adocao")
  revalidatePath("/perdidos")
  revalidatePath("/encontrados")
  revalidatePath("/ongs")
  revalidatePath("/eventos")
  revalidatePath("/historias")

  return { success: true, message: "Páginas principais revalidadas com sucesso" }
}

/**
 * Revalida páginas relacionadas a pets
 */
export async function revalidatePetPages() {
  // Revalidar páginas de listagem de pets
  revalidatePath("/adocao")
  revalidatePath("/perdidos")
  revalidatePath("/encontrados")

  // Revalidar página inicial que também mostra pets
  revalidatePath("/")

  return { success: true, message: "Páginas de pets revalidadas com sucesso" }
}

/**
 * Revalida páginas relacionadas a ONGs
 */
export async function revalidateOngPages() {
  // Revalidar página de listagem de ONGs
  revalidatePath("/ongs")

  // Revalidar página inicial que também mostra ONGs
  revalidatePath("/")

  return { success: true, message: "Páginas de ONGs revalidadas com sucesso" }
}

/**
 * Revalida páginas relacionadas a eventos
 */
export async function revalidateEventPages() {
  // Revalidar página de listagem de eventos
  revalidatePath("/eventos")

  // Revalidar página inicial que também mostra eventos
  revalidatePath("/")

  return { success: true, message: "Páginas de eventos revalidadas com sucesso" }
}

/**
 * Revalida páginas relacionadas a histórias
 */
export async function revalidateStoryPages() {
  // Revalidar página de listagem de histórias
  revalidatePath("/historias")

  // Revalidar página inicial que também mostra histórias
  revalidatePath("/")

  return { success: true, message: "Páginas de histórias revalidadas com sucesso" }
}
