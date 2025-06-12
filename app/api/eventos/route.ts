import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "12")

    const filters: { [key: string]: string | undefined } = {
      name: searchParams.get("name") || undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      start_date: searchParams.get("start_date") || undefined,
    }

    let query = supabase.from("events").select("*", { count: "exact" })

    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`)
    }
    if (filters.city) {
      query = query.eq("city", filters.city)
    }
    if (filters.state) {
      query = query.eq("state", filters.state)
    }
    if (filters.start_date) {
      query = query.gte("start_date", filters.start_date)
    }

    query = query.eq("status", "approved")

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: events, count, error } = await query
      .order("start_date", { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Erro ao buscar eventos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / pageSize)

    return NextResponse.json({
      events: events || [],
      totalPages,
      currentPage: page,
      totalEvents: count || 0,
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
