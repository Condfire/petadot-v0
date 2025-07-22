import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome completo é obrigatório."),
    email: z.string().email("Email inválido."),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número."),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    city: z.string().min(1, "Cidade é obrigatória."),
    state: z.string().min(2, "Estado (UF) é obrigatório.").max(2, "Estado (UF) deve ter 2 caracteres."),
    role: z.enum(["user", "ong", "admin"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido."),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token é obrigatório."),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
