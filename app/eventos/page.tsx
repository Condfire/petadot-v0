import type { Metadata } from "next"
import { getEvents } from "@/lib/supabase" // Importar getEvents do local correto
import { EventosClientPage } from "./EventosClientPage" // Importação nomeada
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Eventos | PetaDot",
  description: "Confira os próximos eventos para pets e seus tutores.",
}

export const revalidate = 3600 // revalidar a cada hora

export default async function EventosPage({
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
  if (searchParams.start_date) filters.start_date = searchParams.start_date

  // Desestruturar 'data' e 'count' do objeto retornado por getEvents
  const { data: events, count } = await getEvents(page, pageSize, filters)

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Eventos</h1>
      <Suspense fallback={<div>Carregando eventos...</div>}>
        <EventosClientPage
          initialEvents={events} // Passa o array de eventos
          totalEvents={count}
          currentPage={page}
          pageSize={pageSize}
          initialFilters={filters}
        />
      </Suspense>
    </main>
  )
}
