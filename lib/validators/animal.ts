import * as z from "zod"

export const PetFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  species: z.string().min(1, { message: "Espécie é obrigatória." }),
  other_species: z.string().optional(),
  breed: z.string().optional(),
  other_breed: z.string().optional(),
  age: z.string().min(1, { message: "Idade é obrigatória." }),
  size: z.string().min(1, { message: "Porte é obrigatório." }),
  gender: z.string().min(1, { message: "Gênero é obrigatório." }),
  color: z.string().optional(),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres." }),
  contact_whatsapp: z
    .string()
    .regex(/^\d{10,11}$/, { message: "Número de WhatsApp inválido (apenas números, 10 ou 11 dígitos)." }),
  images: z
    .array(z.string())
    .min(1, { message: "Pelo menos uma imagem é obrigatória." })
    .max(5, { message: "Máximo de 5 imagens." }),
  city: z.string().min(1, { message: "Cidade é obrigatória." }),
  state: z.string().min(1, { message: "Estado é obrigatório." }),
  is_special_needs: z.boolean().optional(),
  status: z.string().optional(), // Adicionado para permitir status no formulário
  main_image_url: z.string().optional(),
  category: z.enum(["adoption", "lost", "found"]),
})

export type PetFormSchemaType = z.infer<typeof PetFormSchema>
