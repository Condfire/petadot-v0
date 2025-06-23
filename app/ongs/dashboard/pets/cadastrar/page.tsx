import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CadastrarPetClient from "./client"

export const dynamic = "force-dynamic"

export default async function CadastrarPetPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/ongs/login?message=Faça login para cadastrar pets")
  }

  // Buscar a ONG do usuário logado
  const { data: ongData, error: ongError } = await supabase
    .from("ongs")
    .select("id, name")
    .eq("user_id", user.id)
    .single()

  if (ongError || !ongData) {
    // Redirecionar ou mostrar erro se a ONG não for encontrada
    console.error("Erro ao buscar dados da ONG:", ongError)
    redirect("/ongs/dashboard?error=ONG não encontrada ou não associada ao usuário.")
  }

  return <CadastrarPetClient ongId={ongData.id} ongName={ongData.name} />
}
