import type { Metadata } from "next"
import { CadastrarPetEncontradoClientPage } from "./CadastrarPetEncontradoClientPage"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Cadastrar Pet Encontrado | Petadot",
  description: "Registre um pet encontrado para ajudar a reunir com seu dono.",
}

export default async function CadastrarPetEncontradoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?redirect=/encontrados/cadastrar")
  }

  return <CadastrarPetEncontradoClientPage />
}
