import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generatePetSlug, generateUniqueSlug } from "@/lib/slug-utils"

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const petData = await request.json()

    // Verificar se é uma edição ou criação
    const isEditing = petData.is_editing === true

    // Se for edição, atualizar o pet existente
    if (isEditing && petData.id) {
      // Se o slug já existir, não o sobrescrever
      const updateData = { ...petData }
      delete updateData.is_editing
      delete updateData.slug // Não atualizar o slug se já existir

      const { error: updateError } = await supabase
        .from("pets")
        .update(updateData)
        .eq("id", petData.id)
        .eq("user_id", session.user.id)

      if (updateError) {
        console.error("Erro ao atualizar pet:", updateError)
        return NextResponse.json({ error: `Erro ao atualizar pet: ${updateError.message}` }, { status: 500 })
      }

      // Revalidar as páginas relacionadas
      revalidatePath("/adocao")
      revalidatePath(`/adocao/${petData.id}`)
      revalidatePath("/my-pets")

      return NextResponse.json({ success: true })
    }

    // Caso contrário, criar um novo pet
    // Inserir no banco de dados para obter o ID
    const newPet = {
      ...petData,
      user_id: session.user.id,
      status: "approved",
      created_at: new Date().toISOString(),
    }

    // Remover campos que não devem ser inseridos
    delete newPet.is_editing
    delete newPet.slug

    const { data: insertedPet, error: insertError } = await supabase.from("pets").insert(newPet).select().single()

    if (insertError) {
      console.error("Erro ao cadastrar pet:", insertError)
      return NextResponse.json({ error: `Erro ao cadastrar pet: ${insertError.message}` }, { status: 500 })
    }

    // Gerar slug com o ID obtido
    if (insertedPet) {
      const petType = "adocao"

      // Gerar slug base
      const baseSlug = await generatePetSlug(
        petData.name || "pet",
        petType,
        petData.city || "",
        petData.state || "",
        insertedPet.id,
        "pets",
      )

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "pets", insertedPet.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("pets").update({ slug: uniqueSlug }).eq("id", insertedPet.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do pet para adoção:", updateError)
      }
    }

    // Revalidar as páginas relacionadas
    revalidatePath("/adocao")
    revalidatePath("/my-pets")

    return NextResponse.json({ success: true, data: insertedPet })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: `Erro ao processar requisição: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
