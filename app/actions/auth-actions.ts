"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { generateEntitySlug, generateUniqueSlug } from "@/lib/slug-utils"
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
    .or(z.literal("")),
  mission: z.string().optional(),
  ngoContactEmail: z.string().email("Email de contato da ONG inválido.").optional().or(z.literal("")),
  ngoContactPhone: z.string().optional(),
  ngoWebsite: z.string().url("Website inválido.").optional().or(z.literal("")),
  ngoAddress: z.string().optional(),
  ngoCity: z.string().min(1, "Cidade da ONG é obrigatória."),
  ngoState: z.string().min(2, "Estado (UF) da ONG é obrigatório."),
  ngoPostalCode: z.string().optional(),
  verificationDocumentUrl: z.string().url("URL do documento inválida.").optional().or(z.literal("")),
})

const registerUserAndNgoSchema = z.discriminatedUnion("isNgo", [
  z.object({ isNgo: z.literal(false) }).merge(commonUserSchema),
  z
    .object({ isNgo: z.literal(true) })
    .merge(commonUserSchema)
    .merge(ngoSchema),
])

export type RegisterUserAndNgoInput = z.infer<typeof registerUserAndNgoSchema>

export async function registerUserAndNgoAction(
  input: RegisterUserAndNgoInput,
): Promise<{ success: boolean; message: string; userId?: string; ongId?: string }> {
  const supabase = createServerActionClient({ cookies })

  const validation = registerUserAndNgoSchema.safeParse(input)
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

  const { error: userInsertError } = await supabase.from("users").upsert(
    [
      {
        id: newUserId,
        email,
        name: personalName,
        type: userMetadata.type,
        state: userState || null,
        city: userCity || null,
      },
    ],
    { onConflict: "id" },
  )

  if (userInsertError && userInsertError.code !== "23505") {
    console.error("Erro ao inserir usuário em public.users:", userInsertError)
    return { success: false, message: userInsertError.message }
  }

  if (isNgo) {
    const ngoData = validation.data
    try {
      const baseSlug = await generateEntitySlug(
        "ong",
        { name: ngoData.ngoName, city: ngoData.ngoCity, state: ngoData.ngoState },
        undefined,
      )
      const uniqueSlug = await generateUniqueSlug(baseSlug, "ongs", undefined)

      const { data: ong, error: ongInsertError } = await supabase
        .from("ongs")
        .insert({
          user_id: newUserId,
          name: ngoData.ngoName,
          cnpj: ngoData.cnpj || null,
          mission: ngoData.mission || null,
          contact_email: ngoData.ngoContactEmail || email,
          contact_phone: ngoData.ngoContactPhone || null,
          website: ngoData.ngoWebsite || null,
          address: ngoData.ngoAddress || null,
          city: ngoData.ngoCity,
          state: ngoData.ngoState,
          postal_code: ngoData.ngoPostalCode || null,
          verification_document_url: ngoData.verificationDocumentUrl || null,
          is_verified: true,
          slug: uniqueSlug,
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

      const { error: userUpdateError } = await supabase.from("users").update({ type: "ngo_admin" }).eq("id", newUserId)

      if (userUpdateError) {
        console.warn("Failed to explicitly update user type in public.users:", userUpdateError.message)
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

export async function loginAction(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validatedData = loginSchema.parse(data)
    const supabase = createServerActionClient({ cookies })

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return { success: false, error: "Email ou senha incorretos" }
    }

    if (!authData.user) {
      return { success: false, error: "Erro ao fazer login" }
    }

    return { success: true, user: authData.user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Login error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function logoutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/")
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
    }

    const validatedData = forgotPasswordSchema.parse(data)
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      console.error("Password reset error:", error)
      return { success: false, error: "Erro ao enviar email de recuperação" }
    }

    return { success: true, message: "Se o email existir, você receberá instruções para redefinir sua senha" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Forgot password error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const data = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validatedData = resetPasswordSchema.omit({ token: true }).parse(data)
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })

    if (error) {
      console.error("Password update error:", error)
      return { success: false, error: "Erro ao atualizar senha" }
    }

    return { success: true, message: "Senha redefinida com sucesso" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error("Reset password error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}
