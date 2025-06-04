import type { Metadata } from "next"
import Link from "next/link"
import SectionHeader from "@/components/section-header"
import { Button } from "@/components/ui/button"
import EncontradosClientPage from "./EncontradosClientPage"
import { getFoundPets } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Pets Encontrados | PetAdot",
  description: "Pets encontrados aguardando por seus tutores. Ajude a reunir famílias.",
}

// Desabilitar completamente o cache para esta página
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FoundPetsPage() {
  // Usar a função existente para buscar pets encontrados
  const foundPetsResult = await getFoundPets()
  const foundPets = foundPetsResult.data || []

  console.log(`Renderizando página de pets encontrados com ${foundPets.length} pets`)

  // Se houver dados, mostrar detalhes do primeiro pet para depuração
  if (foundPets && foundPets.length > 0) {
    console.log("Primeiro pet encontrado:", {
      id: foundPets[0].id,
      name: foundPets[0].name || "Sem nome",
      status: foundPets[0].status,
    })
  }

  return (
    <div className="container py-8 md:py-12">
      <SectionHeader
        title="Pets Encontrados"
        description="Estes pets foram encontrados e estão aguardando por seus tutores. Se algum deles for seu, entre em contato."
      />

      <EncontradosClientPage
        pets={foundPets}
        pagination={{
          total: foundPetsResult.total,
          page: foundPetsResult.page,
          pageSize: foundPetsResult.pageSize,
          totalPages: foundPetsResult.totalPages,
        }}
      />

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
}
