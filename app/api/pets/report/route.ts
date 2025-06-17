import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Você precisa estar logado para denunciar um pet." }, { status: 401 })
    }

    const { petId, reason, details } = await request.json()

    // Validate required fields
    if (!petId || !reason) {
      return NextResponse.json({ error: "Pet ID e motivo são obrigatórios." }, { status: 400 })
    }

    // Validate reason
    const validReasons = [
      "inappropriate_content",
      "fake_listing",
      "spam",
      "animal_abuse",
      "incorrect_information",
      "already_adopted",
      "other",
    ]

    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Motivo da denúncia inválido." }, { status: 400 })
    }

    // Check if pet exists
    const { data: pet, error: petError } = await supabase.from("pets").select("id").eq("id", petId).single()

    if (petError || !pet) {
      return NextResponse.json({ error: "Pet não encontrado." }, { status: 404 })
    }

    // Check if user already reported this pet
    const { data: existingReport } = await supabase
      .from("pet_reports")
      .select("id")
      .eq("pet_id", petId)
      .eq("user_id", session.user.id)
      .single()

    if (existingReport) {
      return NextResponse.json({ error: "Você já denunciou este pet." }, { status: 409 })
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from("pet_reports")
      .insert({
        pet_id: petId,
        user_id: session.user.id,
        reason,
        details: details || null,
        status: "pending",
      })
      .select()
      .single()

    if (reportError) {
      console.error("Erro ao criar denúncia:", reportError)
      return NextResponse.json({ error: "Erro ao enviar denúncia. Tente novamente." }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Denúncia enviada com sucesso.",
        reportId: report.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro na API de denúncia:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
