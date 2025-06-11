"use client"

import { getEvents } from "@/lib/supabase"
import { EventosClientPage } from "@/app/eventos/EventosClientPage" // Assuming EventosClientPage is a named export

export default async function AdminEventsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number.parseInt(searchParams.page || "1")
  const { data: events, count } = await getEvents({ page, pageSize: 10 }) // Assuming getEvents returns data and count

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Eventos</h1>
      <EventosClientPage events={events} totalCount={count} currentPage={page} />
    </div>
  )
}
