import { getEvents } from "@/lib/supabase"
import { EventosClientPage } from "@/app/eventos/EventosClientPage"

export default async function AdminEventsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number.parseInt(searchParams.page || "1")
  const {
    data: initialEvents,
    count: totalEvents,
  } = await getEvents(page, 10)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Eventos</h1>
      <EventosClientPage
        initialEvents={initialEvents}
        totalEvents={totalEvents}
        currentPage={page}
        pageSize={10}
        initialFilters={{}}
      />
    </div>
  )
}
