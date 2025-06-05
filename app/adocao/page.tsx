import type { Metadata } from "next"
import { Suspense } from "react"
import AdocaoClientPage from "./AdocaoClientPage"
import { getPetsForAdoption } from "@/lib/supabase"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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
  // Obter sessão do usuário
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id

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
    const allPets = petsResult?.data || []

    // Aplicar regras de visibilidade
    const visiblePets = allPets.filter((pet) => {
      const status = pet.status?.toLowerCase() || ""

      // Pets aprovados são visíveis para todos
      if (status === "approved" || status === "aprovado") {
        return true
      }

      // Pets pendentes/rejeitados só são visíveis para o dono
      if (currentUserId && pet.user_id === currentUserId) {
        return true
      }

      return false
    })

    return (
      <Suspense fallback={<div className="container py-12 text-center">Carregando...</div>}>
        <AdocaoClientPage
          initialPets={visiblePets}
          currentUserId={currentUserId}
          pagination={{
            currentPage: petsResult?.page || 1,
            totalPages: petsResult?.totalPages || 1,
            totalItems: visiblePets.length,
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
          currentUserId={currentUserId}
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          }}
          initialFilters={filters}
        />
      </Suspense>
    )
  }
}
