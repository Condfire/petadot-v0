import { NextResponse } from "next/server"
import { getEvents } from "@/lib/supabase" // Importar getEvents do local correto

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || "1")
    const pageSize = Number(searchParams.get("pageSize") || "12")
    const name = searchParams.get("name") || undefined
    const city = searchParams.get("city") || undefined
    const state = searchParams.get("state") || undefined
    const start_date = searchParams.get("start_date") || undefined

    const filters: any = {}
    if (name) filters.name = name
    if (city) filters.city = city
    if (state) filters.state = state
    if (start_date) filters.start_date = start_date

    const { data: events, count } = await getEvents(page, pageSize, filters)

    return NextResponse.json({ events, count })
  } catch (error) {
    console.error("Error in /api/eventos route:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
