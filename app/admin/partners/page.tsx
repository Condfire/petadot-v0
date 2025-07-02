import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic"

async function getPartners() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase.from("partners").select("*").order("name")

  if (error) {
    console.error("Erro ao buscar parceiros:", error)
    return []
  }

  return data || []
}

export default async function AdminPartnersPage() {
  const partners = await getPartners()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Parceiros</h1>
        <Button asChild>
          <Link href="/admin/partners/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Parceiro
          </Link>
        </Button>
      </div>

      {partners.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Nenhum parceiro cadastrado</h3>
          <p className="text-gray-400 mb-4">Comece adicionando seu primeiro parceiro para exibir na página pública.</p>
          <Button asChild>
            <Link href="/admin/partners/new">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Parceiro
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-3 text-left">Imagem</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Localização</th>
                  <th className="px-4 py-3 text-left">Website</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        <Image
                          src={partner.logo_url || "/placeholder.svg?height=100&width=100&query=empresa"}
                          alt={partner.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{partner.name}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {[partner.city, partner.state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {partner.website ? (
                        <Link
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline truncate block max-w-xs"
                        >
                          {partner.website}
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/partners/${partner.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <Link href={`/admin/partners/${partner.id}/delete`}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
