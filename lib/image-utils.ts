import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function uploadImage(file: File, bucket: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { publicUrl: null, error }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return { publicUrl, error: null }
  } catch (error: any) {
    return { publicUrl: null, error }
  }
}

export async function deleteImage(url: string, bucket: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Extract path from URL
    const urlParts = url.split("/")
    const path = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Delete error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Delete error:", error)
    return { success: false, error: error.message }
  }
}

export async function generateEntitySlug(
  entityType: string,
  data: { name: string; city: string; state: string },
  excludeId?: string,
): Promise<string> {
  const cleanName = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  const cleanCity = data.city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  const cleanState = data.state.toLowerCase()
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 5)

  return `${cleanName}-${cleanCity}-${cleanState}-${timestamp}${random}`
}

export async function generateUniqueSlug(baseSlug: string, table: string, excludeId?: string): Promise<string> {
  const supabase = createServerComponentClient({ cookies })

  let slug = baseSlug
  let counter = 1

  while (true) {
    let query = supabase.from(table).select("id").eq("slug", slug)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
