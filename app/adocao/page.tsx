import type { Metadata } from "next"
import { Suspense } from "react"
import AdocaoClientPage from "./AdocaoClientPage"
import { getPetsForAdoption } from "@/lib/supabase"

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
  }

  try {
    // Buscar pets para adoção com paginação e filtros
    const petsResult = await getPetsForAdoption(validPage, validPageSize, filters)

    // A função getPetsForAdoption já retorna apenas pets aprovados e com a estrutura correta.
    // petsResult.data já contém os pets filtrados.
    const initialPetsData = petsResult?.data || []

    return (
      <Suspense fallback={<div className="container py-12 text-center">Carregando...</div>}>
        <AdocaoClientPage
          initialPets={initialPetsData}
          pagination={{
            currentPage: petsResult?.page || 1,
            totalPages: petsResult?.totalPages || 1,
            totalItems: petsResult?.total || 0,
          }}
          initialFilters={filters}
        />
      </Suspense>
    )
  } catch (error) {
    console.error("Erro ao carregar pets para adoção:", error)
    // Em caso de erro, retornar uma página com dados vazios
    return (
      <Suspense fallback={<div className="container py-12 text-center">Carregando...</div>}>
        <AdocaoClientPage
          initialPets={[]}
          pagination={{
            currentPage: 1,
            totalPages: 1, // Evitar totalPages: 0 se possível
            totalItems: 0,
          }}
          initialFilters={filters}
        />
      </Suspense>
    )
  }
}
