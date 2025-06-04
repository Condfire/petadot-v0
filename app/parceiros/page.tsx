import type { Metadata } from "next"
import { getPartners } from "@/lib/supabase"
import ParceirosClientPage from "./ParceirosClientPage"

export const metadata: Metadata = {
  title: "Parceiros | PetaDot",
  description: "Conheça os parceiros que apoiam nossa causa.",
}

export const revalidate = 3600 // revalidar a cada hora

export default async function ParceirosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page as string) : 1
  const pageSize = 12

  // Extrair filtros dos parâmetros de busca
  const filters: any = {}
  if (searchParams.name) filters.name = searchParams.name

  const { data: partners, count } = await getPartners(page, pageSize, filters)

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nossos Parceiros</h1>
      <ParceirosClientPage
        initialPartners={partners}
        totalPartners={count}
        currentPage={page}
        pageSize={pageSize}
        initialFilters={filters}
      />
    </main>
  )
}
