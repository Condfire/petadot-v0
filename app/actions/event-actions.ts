"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateEventSlug, generateUniqueSlug } from "@/lib/slug-utils"

// Função para excluir um evento
export async function deleteEvent(eventId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }
    const userId = session.session.user.id

    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()
    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("ong_id", ong.id)
      .single()

    if (eventError || !event) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para excluí-lo" }
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId)
    if (error) {
      console.error("Erro ao excluir evento Supabase:", error)
      return { success: false, error: "Erro ao excluir evento do banco de dados" }
    }

    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")
    revalidatePath(`/eventos/${eventId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Erro inesperado ao excluir evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação de exclusão" }
  }
}

// Função para atualizar um evento
export async function updateEvent(eventId: string, eventData: any) {
  console.log("[Action updateEvent] Data received:", eventData)
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }
    const userId = session.session.user.id

    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()
    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

    const { data: existingEvent, error: eventError } = await supabase
      .from("events")
      .select("*") // Select all to compare for slug regeneration
      .eq("id", eventId)
      .eq("ong_id", ong.id)
      .single()

    if (eventError || !existingEvent) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para editá-lo" }
    }

    let slug = existingEvent.slug
    if (
      eventData.name !== existingEvent.name ||
      eventData.location !== existingEvent.location ||
      eventData.date !== existingEvent.date // Assuming eventData.date is already an ISO string
    ) {
      const baseSlug = await generateEventSlug(
        eventData.name || "evento",
        eventData.location || "",
        eventData.date || "", // Ensure this is the ISO date string
        eventId,
      )
      slug = await generateUniqueSlug(baseSlug, "events", eventId)
      console.log("[Action updateEvent] New slug generated:", slug)
    }

    const updatePayload = {
      ...eventData,
      slug,
      updated_at: new Date().toISOString(),
    }
    console.log("[Action updateEvent] Update payload:", updatePayload)

    const { error: updateDbError } = await supabase.from("events").update(updatePayload).eq("id", eventId)
    if (updateDbError) {
      console.error("Erro ao atualizar evento Supabase:", updateDbError)
      return { success: false, error: "Erro ao atualizar evento no banco de dados" }
    }

    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")
    revalidatePath(`/eventos/${slug}`) // Use new slug for revalidation
    revalidatePath(`/ongs/dashboard/eventos/${eventId}/edit`)
    return { success: true }
  } catch (error: any) {
    console.error("Erro inesperado ao atualizar evento:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação de atualização" }
  }
}

// Função para obter um evento pelo ID para edição
export async function getEventForEdit(eventId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }
    const userId = session.session.user.id

    const { data: ong } = await supabase.from("ongs").select("id").eq("user_id", userId).single()
    if (!ong) {
      return { success: false, error: "ONG não encontrada" }
    }

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
  } catch (error: any) {
    console.error("Erro ao buscar evento para edição:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação" }
  }
}

// Função para criar um evento
export async function createEvent(eventData: {
  name: string
  description: string
  location: string
  date: string // Expecting ISO string
  image_url?: string
}) {
  console.log("[Action createEvent] Received data:", eventData)
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.log("[Action createEvent] User not authenticated.")
      return { success: false, error: "Usuário não autenticado" }
    }
    const userId = sessionData.session.user.id
    console.log("[Action createEvent] User ID:", userId)

    const { data: ongData, error: ongError } = await supabase.from("ongs").select("id").eq("user_id", userId).single()

    if (ongError || !ongData) {
      console.error("[Action createEvent] ONG not found or error:", ongError)
      return { success: false, error: "ONG não encontrada ou erro ao buscar ONG." }
    }
    console.log("[Action createEvent] ONG ID:", ongData.id)

    const insertPayload = {
      ...eventData, // name, description, location, date (ISO), image_url
      ong_id: ongData.id,
      user_id: userId,
      status: "pending", // Default status
      // created_at and updated_at will be handled by Supabase defaults/triggers
    }
    console.log("[Action createEvent] Inserting event with payload:", insertPayload)

    const { data: insertedEvents, error: insertError } = await supabase
      .from("events")
      .insert([insertPayload])
      .select("id, name, location, date") // Select fields needed for slug

    if (insertError) {
      console.error("[Action createEvent] Supabase insert error:", insertError)
      return { success: false, error: "Erro ao criar evento no banco de dados." }
    }

    if (!insertedEvents || insertedEvents.length === 0) {
      console.error("[Action createEvent] No event data returned after insert.")
      return { success: false, error: "Falha ao registrar o evento, nenhum dado retornado." }
    }
    const newEvent = insertedEvents[0]
    console.log("[Action createEvent] Event inserted, ID:", newEvent.id)

    // Gerar slug com o ID obtido
    const baseSlug = await generateEventSlug(
      newEvent.name || "evento",
      newEvent.location || "",
      newEvent.date || "", // This should be the ISO date string from newEvent
      newEvent.id,
    )
    const uniqueSlug = await generateUniqueSlug(baseSlug, "events", newEvent.id)
    console.log("[Action createEvent] Generated slug:", uniqueSlug)

    const { error: updateError } = await supabase
      .from("events")
      .update({ slug: uniqueSlug, updated_at: new Date().toISOString() })
      .eq("id", newEvent.id)

    if (updateError) {
      console.error("[Action createEvent] Supabase slug update error:", updateError)
      // Non-critical, event is created. Log and continue.
    }

    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")
    console.log("[Action createEvent] Event creation successful.")
    return { success: true, data: newEvent }
  } catch (error: any) {
    console.error("[Action createEvent] Unexpected error:", error)
    return { success: false, error: "Ocorreu um erro ao processar a solicitação." }
  }
}
