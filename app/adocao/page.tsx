import type { Metadata } from "next"
import { Suspense } from "react"
import AdocaoClientPage from "./AdocaoClientPage"
import { getPetsForAdoption } from "@/lib/supabase" // Assumindo que esta função existe e busca os pets

export const metadata: Metadata = {
  title: "Adoção | PetAdot",
  description: "Encontre um novo amigo para adotar",
}

// Forçar renderização dinâmica para evitar cache
export const dynamic = "force-dynamic"
export const revalidate = 0

interface AdocaoPageProps {
  searchParams: {
    page?: string
    pageSize?: string
    species?: string
    size?: string
    gender?: string
    state?: string
    city?: string
    search?: string
    isSpecialNeeds?: string // Adicionado para filtro
  }
}

export default async function AdocaoPage({ searchParams }: AdocaoPageProps) {
  // Extrair parâmetros de paginação e filtros da URL
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1
  const pageSize = searchParams.pageSize ? Number.parseInt(searchParams.pageSize, 10) : 12

  // Garantir que os valores de paginação sejam válidos
  const validPage = isNaN(page) ? 1 : Math.max(1, page)
  const validPageSize = isNaN(pageSize) ? 12 : Math.max(1, Math.min(50, pageSize))

  // Extrair filtros da URL
  const filters = {
    species: searchParams.species || "",
    size: searchParams.size || "",
    gender: searchParams.gender || "",
    state: searchParams.state || "",
    city: searchParams.city || "",
    search: searchParams.search || "",
    isSpecialNeeds: searchParams.isSpecialNeeds === "true", // Converter para boolean
  }

  // Buscar pets para adoção com paginação e filtros
  const petsResult = await getPetsForAdoption(validPage, validPageSize, filters)

  console.log(
    `[AdocaoPage] Fetched initial pets: ${petsResult.data.length}. Total: ${petsResult.total}. Page: ${petsResult.page}`,
  )
  petsResult.data.forEach((p) => console.log(`[AdocaoPage] Initial Pet ${p.id}: main_image_url=${p.main_image_url}`))

  return (
    <Suspense fallback={<div className="container py-12 text-center">Carregando...</div>}>
      <AdocaoClientPage
        initialPets={petsResult.data}
        pagination={{
          currentPage: petsResult.page,
          totalPages: petsResult.totalPages,
          totalItems: petsResult.total,
        }}
        initialFilters={filters}
      />
    </Suspense>
  )
}
