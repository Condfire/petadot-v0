"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateEventSlug, generateUniqueSlug } from "@/lib/slug-utils"

// Função para excluir um evento
export async function deleteEvent(eventId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.session.user.id

    // Verificar se o evento pertence ao usuário
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
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
export async function updateEvent(eventId: string, eventData: any) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.session.user.id

    // Verificar se o evento pertence ao usuário
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .single()

    if (eventError || !event) {
      return { success: false, error: "Evento não encontrado ou você não tem permissão para editá-lo" }
    }

    // Gerar novo slug se o título, local ou data foram alterados
    let slug = event.slug
    if (
      eventData.name !== event.title ||
      eventData.location !== event.location ||
      eventData.date !== event.start_date
    ) {
      // Gerar slug base
      const baseSlug = await generateEventSlug(
        eventData.name || "evento",
        eventData.location || "",
        eventData.date || "",
        eventId,
      )

      // Garantir que o slug seja único
      slug = await generateUniqueSlug(baseSlug, "events", eventId)
    }

    // Mapear os dados do formulário para os campos corretos da tabela
    const updatePayload = {
      title: eventData.name, // name -> title
      description: eventData.description,
      location: eventData.location,
      start_date: eventData.date, // date -> start_date
      image_url: eventData.image_url,
      slug,
      updated_at: new Date().toISOString(),
    }

    // Atualizar o evento
    const { error } = await supabase.from("events").update(updatePayload).eq("id", eventId)

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
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.session.user.id

    // Buscar o evento
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
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
export async function createEvent(eventData: {
  name: string
  description: string
  location: string
  date: string
  image_url?: string
}) {
  console.log("[createEvent] Dados recebidos:", eventData)

  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Verificar se o usuário está autenticado
    const { data: session, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("[createEvent] Erro ao obter sessão:", sessionError)
      return { success: false, error: "Erro ao verificar autenticação" }
    }

    if (!session.session) {
      console.log("[createEvent] Usuário não autenticado")
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = session.session.user.id
    console.log("[createEvent] ID do usuário:", userId)

    // Preparar dados para inserção - mapear para os campos corretos da tabela
    const insertData = {
      title: eventData.name, // name -> title
      description: eventData.description,
      location: eventData.location,
      start_date: eventData.date, // date -> start_date
      image_url: eventData.image_url || null,
      user_id: userId, // usar user_id em vez de ong_id
      status: "pending",
      created_at: new Date().toISOString(),
    }

    console.log("[createEvent] Dados para inserção:", insertData)

    // Inserir o evento
    const { data: insertedEvent, error: insertError } = await supabase
      .from("events")
      .insert([insertData])
      .select("id, title, location, start_date")
      .single()

    if (insertError) {
      console.error("[createEvent] Erro ao inserir evento:", insertError)
      return { success: false, error: "Erro ao criar evento: " + insertError.message }
    }

    if (!insertedEvent) {
      console.error("[createEvent] Nenhum evento retornado após inserção")
      return { success: false, error: "Erro ao criar evento - nenhum dado retornado" }
    }

    console.log("[createEvent] Evento inserido com sucesso:", insertedEvent)

    // Gerar slug com o ID obtido
    try {
      const baseSlug = await generateEventSlug(
        insertedEvent.title || "evento",
        insertedEvent.location || "",
        insertedEvent.start_date || "",
        insertedEvent.id,
      )

      const uniqueSlug = await generateUniqueSlug(baseSlug, "events", insertedEvent.id)
      console.log("[createEvent] Slug gerado:", uniqueSlug)

      // Atualizar o registro com o slug
      const { error: updateError } = await supabase
        .from("events")
        .update({ slug: uniqueSlug })
        .eq("id", insertedEvent.id)

      if (updateError) {
        console.error("[createEvent] Erro ao atualizar slug:", updateError)
        // Não retornar erro aqui, pois o evento foi criado com sucesso
      }
    } catch (slugError) {
      console.error("[createEvent] Erro na geração de slug:", slugError)
      // Não retornar erro aqui, pois o evento foi criado com sucesso
    }

    // Revalidar páginas
    revalidatePath("/eventos")
    revalidatePath("/ongs/dashboard")

    console.log("[createEvent] Evento criado com sucesso")
    return { success: true, data: insertedEvent }
  } catch (error: any) {
    console.error("[createEvent] Erro inesperado:", error)
    return { success: false, error: "Erro inesperado: " + (error.message || "Erro desconhecido") }
  }
}
