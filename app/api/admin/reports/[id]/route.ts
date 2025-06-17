import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, adminNotes } = await request.json()
    const reportId = params.id

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Get the current user and verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase.from("users").select("type").eq("id", user.id).single()

    if (userError || userData?.type !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Update the report
    const { data: report, error: updateError } = await supabase
      .from("pet_reports")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar denúncia:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar denúncia" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Denúncia atualizada com sucesso",
      report,
    })
  } catch (error) {
    console.error("Erro na API de atualização de denúncia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
