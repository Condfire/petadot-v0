"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateEventSlug, generateUniqueSlug } from "@/lib/slug-utils"
import type { EventDB } from "@/lib/mappers" // Import EventDB type

// Função para excluir um evento
export async function deleteEvent(eventId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se o evento pertence à ONG do usuário
    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    // Verificar se o evento pertence à ONG
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("ong_id", ong.id)
      .single()

    if (eventError || !event) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para excluí-lo" }
    }

    // Excluir o evento
    const { error } = await supabase.from("events").delete().eq("id", eventId)

    if (error) {
      console.error("Erro ao excluir evento:", error)
      return { success: false, error: "Erro ao excluir evento" }
    }

    // Revalidar páginas
    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")
    revalidatePath(`/eventos/${eventId}`)

    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação" }
  }
}

// Função para atualizar um evento
export async function updateEvent(eventId: string, eventData: Partial<EventDB>) {
  // Use Partial<EventDB>
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se o evento pertence à ONG do usuário
    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    // Verificar se o evento pertence à ONG
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("ong_id", ong.id)
      .single()

    if (eventError || !event) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para editá-lo" }
    }

    // Gerar novo slug se o nome, local ou data de início foram alterados
    let slug = event.slug
    if (
      eventData.name !== event.name ||
      eventData.location !== event.location ||
      eventData.start_date !== event.start_date
    ) {
      // Gerar slug base
      const baseSlug = await generateEventSlug(
        eventData.name || "evento",
        eventData.location || "",
        eventData.start_date || "", // Use start_date
        eventId,
      )

      // Garantir que o slug seja único
      slug = await generateUniqueSlug(baseSlug, "events", eventId)
    }

    // Atualizar o evento
    const { error } = await supabase
      .from("events")
      .update({
        ...eventData,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)

    if (error) {
      console.error("Erro ao atualizar evento:", error)
      return { success: false, error: "Erro ao atualizar evento" }
    }

    // Revalidar páginas
    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")
    revalidatePath(`/eventos/${eventId}`)
    revalidatePath(`/ongs/dashboard/eventos/${eventId}/edit`)

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação" }
  }
}

// Função para obter um evento pelo ID
export async function getEventForEdit(eventId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se o evento pertence à ONG do usuário
    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    // Buscar o evento
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("ong_id", ong.id)
      .single()

    if (eventError || !event) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para editá-lo" }
    }

    return { success: true, event }
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação" }
  }
}

// Função para criar um evento
export async function createEvent(eventData: EventDB) {
  // Use EventDB type
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.user.id

    // Verificar se o usuário é uma ONG
    const { data: ong, error: ongError } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

    if (ongError || !ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    // Inserir o evento para obter o ID
    const { data: newEventData, error: insertError } = await supabase // Renamed eventData to newEventData to avoid conflict
      .from("events")
      .insert([
        {
          ...eventData,
          ong_id: ong.id,
          user_id: userId,
          status: "approved", // Temporariamente alterado para teste
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      console.error("Erro ao criar evento:", insertError)
      return { success: false, error: "Erro ao criar evento" }
    }

    // Gerar slug com o ID obtido
    if (newEventData && newEventData.length > 0) {
      const event = newEventData[0]

      // Gerar slug base
      const baseSlug = await generateEventSlug(
        event.name || "evento",
        event.location || "",
        event.start_date || "",
        event.id,
      ) // Use event.name and event.start_date

      // Garantir que o slug seja único
      const uniqueSlug = await generateUniqueSlug(baseSlug, "events", event.id)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase.from("events").update({ slug: uniqueSlug }).eq("id", event.id)

      if (updateError) {
        console.error("Erro ao atualizar slug do evento:", updateError)
      }
    }

    // Revalidar páginas
    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")

    return { success: true, data: newEventData }
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação" }
  }
}
