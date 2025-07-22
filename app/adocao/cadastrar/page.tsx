import type { Metadata } from "next"
import { CadastrarPetAdocaoClientPage } from "./CadastrarPetAdocaoClientPage"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Cadastrar Pet para Adoção | Petadot",
  description: "Registre um pet disponível para adoção.",
}

export default async function CadastrarPetAdocaoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?redirect=/adocao/cadastrar")
  }

  return <CadastrarPetAdocaoClientPage />
}
