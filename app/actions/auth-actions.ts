"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { generateEntitySlug, generateUniqueSlug } from "@/lib/slug-utils"

const commonUserSchema = z.object({
  personalName: z.string().min(2, "Nome pessoal é obrigatório."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  userState: z.string().optional(),
  userCity: z.string().optional(),
})

const ngoSchema = z.object({
  ngoName: z.string().min(2, "Nome da ONG é obrigatório."),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX")
    .optional()
    .or(z.literal("")), // Optional for now, but good to have format
  mission: z.string().optional(),
  ngoContactEmail: z.string().email("Email de contato da ONG inválido.").optional().or(z.literal("")),
  ngoContactPhone: z.string().optional(),
  ngoWebsite: z.string().url("Website inválido.").optional().or(z.literal("")),
  ngoAddress: z.string().optional(),
  ngoCity: z.string().min(1, "Cidade da ONG é obrigatória."),
  ngoState: z.string().min(2, "Estado (UF) da ONG é obrigatória."),
  ngoPostalCode: z.string().optional(),
  verificationDocumentUrl: z.string().url("URL do documento inválida.").optional().or(z.literal("")),
})

const registerUserSchema = z.discriminatedUnion("isNgo", [
  z.object({ isNgo: z.literal(false) }).merge(commonUserSchema),
  z
    .object({ isNgo: z.literal(true) })
    .merge(commonUserSchema)
    .merge(ngoSchema),
])

export type RegisterUserAndNgoInput = z.infer<typeof registerUserSchema>

export async function registerUserAndNgoAction(
  input: RegisterUserAndNgoInput,
): Promise<{ success: boolean; message: string; userId?: string; ongId?: string }> {
  const supabase = createServerActionClient({ cookies })

  const validation = registerUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
    }
  }

  const { personalName, email, password, userState, userCity } = validation.data
  const isNgo = validation.data.isNgo

  const userMetadata: { name: string; type: string; state?: string; city?: string } = {
    name: personalName,
    type: isNgo ? "ngo_admin" : "regular",
  }
  if (userState) userMetadata.state = userState
  if (userCity) userMetadata.city = userCity

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
    },
  })

  if (authError) {
    console.error("Auth signUp error:", authError)
    return { success: false, message: authError.message }
  }

  if (!authData.user) {
    return { success: false, message: "Usuário não criado após o cadastro." }
  }

  const newUserId = authData.user.id

  // Primeiro, criar o registro na tabela users
  console.log("Criando registro na tabela users...")
  const { error: userError } = await supabase.from("users").insert({
    id: newUserId,
    email: email,
    name: personalName,
    type: isNgo ? "ngo_admin" : "regular",
    state: userState || null,
    city: userCity || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (userError && userError.code !== "23505") {
    // 23505 é o código para violação de unique constraint (usuário já existe)
    console.error("Erro ao criar usuário na tabela users:", userError)
    return {
      success: false,
      message: `Erro ao criar perfil de usuário: ${userError.message}`,
      userId: newUserId,
    }
  }

  if (isNgo) {
    const ngoData = validation.data
    try {
      const baseSlug = await generateEntitySlug(ngoData.ngoName, "ong", ngoData.ngoCity, undefined)
      const uniqueSlug = await generateUniqueSlug(baseSlug, "ongs", undefined)

      const { data: ong, error: ongInsertError } = await supabase
        .from("ongs")
        .insert({
          user_id: newUserId,
          name: ngoData.ngoName,
          cnpj: ngoData.cnpj,
          mission: ngoData.mission || null,
          contact_email: ngoData.ngoContactEmail || email,
          contact_phone: ngoData.ngoContactPhone || null,
          website: ngoData.ngoWebsite || null,
          address: ngoData.ngoAddress || null,
          city: ngoData.ngoCity,
          state: ngoData.ngoState,
          postal_code: ngoData.ngoPostalCode || null,
          verification_document_url: ngoData.verificationDocumentUrl || null,
          is_verified: false,
          slug: uniqueSlug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (ongInsertError) {
        console.error("ONG insert error:", ongInsertError)
        return {
          success: false,
          message: `Usuário criado, mas falha ao registrar ONG: ${ongInsertError.message}`,
          userId: newUserId,
        }
      }

      return {
        success: true,
        message: "Usuário e perfil da ONG registrados com sucesso! Verifique seu email para confirmação.",
        userId: newUserId,
        ongId: ong?.id,
      }
    } catch (e: any) {
      console.error("Error during NGO profile creation:", e)
      return {
        success: false,
        message: `Usuário criado, mas erro ao processar perfil da ONG: ${e.message}`,
        userId: newUserId,
      }
    }
  }

  return {
    success: true,
    message: "Usuário registrado com sucesso! Verifique seu email para confirmação.",
    userId: newUserId,
  }
}
