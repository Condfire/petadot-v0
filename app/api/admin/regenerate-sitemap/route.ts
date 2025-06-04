import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST() {
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

  try {
    // Revalidate the sitemap paths
    revalidatePath("/sitemap.xml")
    revalidatePath("/api/sitemap/[type]")

    return NextResponse.json({ message: "Sitemap regenerado com sucesso!" })
  } catch (error) {
    console.error("Error regenerating sitemap:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
