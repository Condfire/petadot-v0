import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateSlug } from "@/lib/slug-utils"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: user } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get table from query params
  const searchParams = request.nextUrl.searchParams
  const table = searchParams.get("table")

  if (!table) {
    return NextResponse.json({ error: "Table parameter is required" }, { status: 400 })
  }

  // Define table configurations
  const tableConfigs: Record<
    string,
    {
      nameField: string
      typeField?: string
      defaultType: string
      cityField: string
      stateField: string
    }
  > = {
    pets: {
      nameField: "name",
      typeField: "species",
      defaultType: "pet",
      cityField: "city",
      stateField: "state",
    },
    pets_lost: {
      nameField: "name",
      typeField: "species",
      defaultType: "perdido",
      cityField: "city",
      stateField: "state",
    },
    pets_found: {
      nameField: "name",
      typeField: "species",
      defaultType: "encontrado",
      cityField: "city",
      stateField: "state",
    },
    ongs: {
      nameField: "name",
      defaultType: "ong",
      cityField: "city",
      stateField: "state",
    },
    events: {
      nameField: "name",
      defaultType: "evento",
      cityField: "city",
      stateField: "state",
    },
    partners: {
      nameField: "name",
      defaultType: "parceiro",
      cityField: "city",
      stateField: "state",
    },
  }

  const config = tableConfigs[table]

  if (!config) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 })
  }

  try {
    // Get records without slugs
    const { data, error } = await supabase.from(table).select("*").is("slug", null)

    if (error) {
      throw new Error(`Error fetching ${table}: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: `No records without slugs in ${table}` })
    }

    // Generate and update slugs
    let updateCount = 0
    const errors = []

    for (const record of data) {
      const name = record[config.nameField] || "sem-nome"
      const type = config.typeField ? record[config.typeField] || config.defaultType : config.defaultType
      const city = record[config.cityField] || "brasil"
      const state = record[config.stateField] || "br"
      const year = new Date().getFullYear()
      const id = record.id

      const slug = generateSlug(name, type, city, state, year, id)

      // Check if slug already exists
      const { data: existingSlug } = await supabase
        .from(table)
        .select("id")
        .eq("slug", slug)
        .not("id", "eq", id)
        .maybeSingle()

      // If slug exists, add a counter
      let finalSlug = slug
      let counter = 1

      while (existingSlug) {
        finalSlug = `${slug}-${counter}`
        counter++

        const { data: checkAgain } = await supabase.from(table).select("id").eq("slug", finalSlug).maybeSingle()

        if (!checkAgain) break
      }

      // Update the record with the slug
      const { error: updateError } = await supabase.from(table).update({ slug: finalSlug }).eq("id", id)

      if (updateError) {
        errors.push(`Error updating ${table} with ID ${id}: ${updateError.message}`)
      } else {
        updateCount++
      }
    }

    return NextResponse.json({
      message: `Generated ${updateCount} slugs for ${table}`,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error("Error generating slugs:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
