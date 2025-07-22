import type { Metadata } from "next"
import { CadastrarPetPerdidoClientPage } from "./CadastrarPetPerdidoClientPage"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Cadastrar Pet Perdido | Petadot",
  description: "Registre um pet perdido para ajudar a encontrá-lo.",
}

export default async function CadastrarPetPerdidoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?redirect=/perdidos/cadastrar")
  }

  return <CadastrarPetPerdidoClientPage />
}
