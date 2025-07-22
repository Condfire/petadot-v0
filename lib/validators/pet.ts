import { z } from "zod"

export const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  species: z.string().min(1, "Espécie é obrigatória"),
  otherSpecies: z.string().optional(),
  breed: z.string().min(1, "Raça é obrigatória").max(100, "Raça muito longa"),
  otherBreed: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória").max(50, "Cor muito longa"),
  size: z.enum(["small", "medium", "large"], {
    errorMap: () => ({ message: "Tamanho deve ser pequeno, médio ou grande" }),
  }),
  gender: z.enum(["male", "female", "unknown"], {
    errorMap: () => ({ message: "Gênero deve ser macho, fêmea ou desconhecido" }),
  }),
  status: z.enum(["lost", "found", "for_adoption"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(1000, "Descrição muito longa"),
  whatsappContact: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos").max(20, "WhatsApp muito longo"),
  city: z.string().min(1, "Cidade é obrigatória").max(100, "Nome da cidade muito longo"),
  state: z.string().min(2, "Estado deve ter 2 caracteres").max(2, "Estado deve ter 2 caracteres"),
  images: z.array(z.instanceof(File)).min(1, "Pelo menos uma imagem é obrigatória").max(5, "Máximo de 5 imagens"),
})

export type PetFormInput = z.infer<typeof petSchema>

// Schema for updating pets (images can be URLs or Files)
export const petUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  species: z.string().min(1, "Espécie é obrigatória"),
  otherSpecies: z.string().optional(),
  breed: z.string().min(1, "Raça é obrigatória").max(100, "Raça muito longa"),
  otherBreed: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória").max(50, "Cor muito longa"),
  size: z.enum(["small", "medium", "large"]),
  gender: z.enum(["male", "female", "unknown"]),
  status: z.enum(["lost", "found", "for_adoption"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(1000, "Descrição muito longa"),
  whatsappContact: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos").max(20, "WhatsApp muito longo"),
  city: z.string().min(1, "Cidade é obrigatória").max(100, "Nome da cidade muito longo"),
  state: z.string().min(2, "Estado deve ter 2 caracteres").max(2, "Estado deve ter 2 caracteres"),
  images: z
    .array(z.union([z.instanceof(File), z.string()]))
    .min(1, "Pelo menos uma imagem é obrigatória")
    .max(5, "Máximo de 5 imagens"),
})

export type PetUpdateInput = z.infer<typeof petUpdateSchema>
