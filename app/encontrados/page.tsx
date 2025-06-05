import type { Metadata } from "next"
import Link from "next/link"
import SectionHeader from "@/components/section-header"
import { Button } from "@/components/ui/button"
import EncontradosClientPage from "./EncontradosClientPage"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Pets Encontrados | PetAdot",
  description: "Pets encontrados aguardando por seus tutores. Ajude a reunir famílias.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function fetchFoundPets() {
  const supabase = createClient()

  try {
    const { data: pets, error } = await supabase
      .from("pets")
      .select(`
        *,
        pet_images (
          url,
          position
        )
      `)
      .eq("category", "found")
      .in("status", ["approved", "aprovado"]) // Apenas pets aprovados para visitantes
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar pets encontrados:", error)
      return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }
    }

    return {
      data: pets || [],
      total: pets?.length || 0,
      page: 1,
      pageSize: 12,
      totalPages: Math.ceil((pets?.length || 0) / 12),
    }
  } catch (error) {
    console.error("Erro inesperado ao buscar pets encontrados:", error)
    return { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }
  }
}

export default async function FoundPetsPage() {
  try {
    const foundPetsResult = await fetchFoundPets()

    console.log(`Renderizando página de pets encontrados com ${foundPetsResult.data.length} pets`)

    return (
      <div className="container py-8 md:py-12">
        <SectionHeader
          title="Pets Encontrados"
          description="Estes pets foram encontrados e estão aguardando por seus tutores. Se algum deles for seu, entre em contato."
        />

        <EncontradosClientPage pets={foundPetsResult.data} pagination={foundPetsResult} />

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-bold mb-4">Encontrou um pet?</h3>
          <p className="mb-4">
            Se você encontrou um pet perdido, cadastre as informações dele aqui para que possamos ajudar a encontrar o
            tutor. Forneça o máximo de detalhes possível para facilitar a identificação.
          </p>
          <div className="flex justify-center">
            <Link href="/encontrados/cadastrar">
              <Button>Cadastrar Pet Encontrado</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Erro na página de encontrados:", error)
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar pets encontrados</h1>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
      </div>
    )
  }
}
