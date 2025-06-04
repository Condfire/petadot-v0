import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cadastrar Pet para Adoção | Petadot",
  description: "Cadastre um pet para adoção e ajude-o a encontrar um novo lar.",
}

export default function CadastrarPetAdocaoPage() {
  // Redirecionamento do lado do servidor para a nova rota
  redirect("/cadastrar-pet-adocao")

  // Este código nunca será executado devido ao redirecionamento acima,
  // mas é necessário para satisfazer o TypeScript
  return null
}
