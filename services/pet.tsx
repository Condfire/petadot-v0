import { createClient } from "@/lib/supabase/server"

export async function getPetByIdOrSlug(idOrSlug: string) {
  const supabase = createClient()

  try {
    // First try to get by ID (if it's a number)
    if (!isNaN(Number(idOrSlug))) {
      const { data: petById, error: errorById } = await supabase
        .from("pets")
        .select("*")
        .eq("id", Number.parseInt(idOrSlug))
        .single()

      if (!errorById && petById) {
        return { data: petById, error: null }
      }
    }

    // If not found by ID or idOrSlug is not a number, try by slug
    const { data: petBySlug, error: errorBySlug } = await supabase
      .from("pets")
      .select("*")
      .eq("slug", idOrSlug)
      .single()

    if (errorBySlug) {
      return { data: null, error: errorBySlug }
    }

    return { data: petBySlug, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
