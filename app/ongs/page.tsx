import type { Metadata } from "next"
import { getOngs } from "@/lib/supabase"
import OngsClientPage from "./OngsClientPage"

export const metadata: Metadata = {
  title: "ONGs | PetaDot",
  description: "Conheça as ONGs parceiras que trabalham pelo bem-estar animal.",
}

export const revalidate = 3600 // revalidar a cada hora

export default async function OngsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = searchParams.page ? Number.parseInt(searchParams.page as string) : 1
  const pageSize = 12

  // Extrair filtros dos parâmetros de busca
  const filters: any = {}
  if (searchParams.name) filters.name = searchParams.name
  if (searchParams.city) filters.city = searchParams.city
  if (searchParams.state) filters.state = searchParams.state

  const { data: ongs, count } = await getOngs(page, pageSize, filters)

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">ONGs Parceiras</h1>
      <OngsClientPage
        initialOngs={ongs}
        totalOngs={count}
        currentPage={page}
        pageSize={pageSize}
        initialFilters={filters}
      />
    </main>
  )
}
