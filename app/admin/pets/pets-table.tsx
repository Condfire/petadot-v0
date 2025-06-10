"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, CheckCircle, XCircle, Search, ArrowUpDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

type PetTableProps = {
  pets: any[]
  type: string
}

export function PetsTable({ pets, type }: PetTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Função para aprovar um pet
  const approvePet = async (id: string, petType: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [id]: true }))

      let tableName = ""
      switch (petType) {
        case "adoption":
          tableName = "pets"
          break
        case "lost":
          tableName = "pets_lost"
          break
        case "found":
          tableName = "pets_found"
          break
        default:
          throw new Error("Tipo de pet inválido")
      }

      const { error } = await supabase.from(tableName).update({ status: "approved" }).eq("id", id)

      if (error) throw error

      // Revalidar a página
      router.refresh()

      // Forçar revalidação das páginas relevantes
      try {
        // Revalidar a página inicial
        await fetch("/api/revalidate/route?path=/", { method: "GET" })

        // Revalidar a página específica do tipo de pet
        let petPath = ""
        switch (petType) {
          case "adoption":
            petPath = "/adocao"
            break
          case "lost":
            petPath = "/perdidos"
            break
          case "found":
            petPath = "/encontrados"
            break
        }

        if (petPath) {
          await fetch(`/api/revalidate/route?path=${petPath}`, { method: "GET" })
          console.log(`Revalidando caminho: ${petPath}`)
        }

        // Revalidar a página específica do pet
        await fetch(`/api/revalidate/route?path=${petPath}/${id}`, { method: "GET" })
      } catch (revalidateError) {
        console.error("Erro ao revalidar páginas:", revalidateError)
      }

      alert(`Pet aprovado com sucesso! A página será atualizada.`)
    } catch (error) {
      console.error("Erro ao aprovar pet:", error)
      alert("Erro ao aprovar pet. Verifique o console para mais detalhes.")
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Função para rejeitar um pet
  const rejectPet = async (id: string, petType: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [id]: true }))

      let tableName = ""
      switch (petType) {
        case "adoption":
          tableName = "pets"
          break
        case "lost":
          tableName = "pets_lost"
          break
        case "found":
          tableName = "pets_found"
          break
        default:
          throw new Error("Tipo de pet inválido")
      }

      const { error } = await supabase.from(tableName).update({ status: "rejected" }).eq("id", id)

      if (error) throw error

      // Revalidar a página
      router.refresh()
    } catch (error) {
      console.error("Erro ao rejeitar pet:", error)
      alert("Erro ao rejeitar pet. Verifique o console para mais detalhes.")
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Função para excluir um pet
  const deletePet = async (id: string, petType: string) => {
    if (!confirm("Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      setIsLoading((prev) => ({ ...prev, [id]: true }))

      let tableName = ""
      switch (petType) {
        case "adoption":
          tableName = "pets"
          break
        case "lost":
          tableName = "pets_lost"
          break
        case "found":
          tableName = "pets_found"
          break
        default:
          throw new Error("Tipo de pet inválido")
      }

      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) throw error

      // Revalidar a página
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir pet:", error)
      alert("Erro ao excluir pet. Verifique o console para mais detalhes.")
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Função para alternar a ordenação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtrar e ordenar os pets
  const filteredPets = pets
    .filter((pet) => {
      // Filtro de busca
      const searchMatch =
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.state?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const statusMatch = statusFilter === "all" || pet.status === statusFilter

      return searchMatch && statusMatch
    })
    .sort((a, b) => {
      // Ordenação
      if (!a[sortField] && !b[sortField]) return 0
      if (!a[sortField]) return 1
      if (!b[sortField]) return -1

      let comparison = 0
      if (typeof a[sortField] === "string") {
        comparison = a[sortField].localeCompare(b[sortField])
      } else {
        comparison = a[sortField] - b[sortField]
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  // Função para obter a cor do badge de status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado"
      case "pending":
        return "Pendente"
      case "rejected":
        return "Rejeitado"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome, espécie, raça, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                <div className="flex items-center">
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("species")}>
                <div className="flex items-center">
                  Espécie
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              {type === "all" && <TableHead>Tipo</TableHead>}
              <TableHead className="cursor-pointer" onClick={() => toggleSort("city")}>
                <div className="flex items-center">
                  Cidade/UF
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("status")}>
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("created_at")}>
                <div className="flex items-center">
                  Cadastrado em
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={type === "all" ? 8 : 7} className="text-center py-10 text-muted-foreground">
                  Nenhum pet encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredPets.map((pet) => (
                <TableRow key={`${pet.type}-${pet.id}`}>
                  <TableCell>
                    {pet.image_url ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={pet.main_image_url || pet.image_url || "/placeholder.svg"}
                          alt={pet.name || "Pet"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{pet.name || "Sem nome"}</TableCell>
                  <TableCell>{pet.species || "N/A"}</TableCell>
                  {type === "all" && (
                    <TableCell>
                      <Badge variant="outline">{pet.typeName}</Badge>
                    </TableCell>
                  )}
                  <TableCell>{`${pet.city || "N/A"}/${pet.state || "N/A"}`}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(pet.status)}>{getStatusText(pet.status)}</Badge>
                  </TableCell>
                  <TableCell>{pet.created_at ? formatDate(pet.created_at) : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link
                          href={`/${pet.type === "adoption" ? "adocao" : pet.type === "lost" ? "perdidos" : "encontrados"}/${pet.id}`}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>

                      {pet.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => approvePet(pet.id, pet.type)}
                            disabled={isLoading[pet.id]}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Aprovar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => rejectPet(pet.id, pet.type)}
                            disabled={isLoading[pet.id]}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Rejeitar</span>
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deletePet(pet.id, pet.type)}
                        disabled={isLoading[pet.id]}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">Total de pets: {filteredPets.length}</div>
    </div>
  )
}
