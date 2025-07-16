"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PetCard } from "@/components/PetCard" // Importação nomeada
import { PaginationControls } from "@/components/pagination-controls"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PetFilters } from "@/components/pet-filters"
import type { Pet } from "@/utils/types" // Importar a interface Pet

interface AdocaoClientPageProps {
  initialPets: Pet[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
  initialFilters?: any
}

export default function AdocaoClientPage({ initialPets, pagination, initialFilters = {} }: AdocaoClientPageProps) {
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(pagination.currentPage)
  const [filters, setFilters] = useState(initialFilters)
  const [total, setTotal] = useState(pagination.totalItems)
  const supabase = createClientComponentClient()
  const itemsPerPage = 12 // Definido aqui ou passado como prop se for variável

  useEffect(() => {
    // Atualiza os estados quando as props iniciais mudam (ex: navegação de página no servidor)
    setPets(initialPets)
    setPage(pagination.currentPage)
    setTotal(pagination.totalItems)
    setFilters(initialFilters)
  }, [initialPets, pagination, initialFilters])

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from("pets")
          .select("*", { count: "exact" })
          .eq("status", "available")
          .eq("category", "adoption") // Adicionar filtro de categoria

        // Aplicar filtros
        if (filters.species) {
          query = query.eq("species", filters.species)
        }
        if (filters.size) {
          query = query.eq("size", filters.size)
        }
        if (filters.gender) {
          query = query.eq("gender", filters.gender)
        }
        if (filters.state) {
          query = query.eq("state", filters.state)
        }
        if (filters.city) {
          query = query.eq("city", filters.city)
        }
        if (filters.isSpecialNeeds) {
          query = query.eq("is_special_needs", true)
        }

        // Paginação
        const from = (page - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, count, error } = await query

        if (error) {
          throw error
        }

        setPets(data || [])
        if (count !== null) {
          setTotal(count)
        }
        console.log(
          `[AdocaoClientPage] Fetched ${data?.length} pets. Total: ${count}. Page: ${page}. Filters:`,
          filters,
        )
        data?.forEach((p) => console.log(`[AdocaoClientPage] Pet ${p.id}: main_image_url=${p.main_image_url}`))
      } catch (error) {
        console.error("Erro ao buscar pets para adoção:", error)
      } finally {
        setLoading(false)
      }
    }

    // Só busca se a página ou filtros mudarem E não for a carga inicial (já veio do servidor)
    // Ou se os filtros mudarem na interação do cliente
    if (page !== pagination.currentPage || JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
      fetchPets()
    }
  }, [page, filters, supabase, initialPets, pagination, initialFilters]) // Adicionado initialPets, pagination, initialFilters para o useEffect

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1) // Resetar para a primeira página ao mudar filtros
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Pets para Adoção</h1>
        <Button asChild>
          <Link href="/cadastrar-pet-adocao">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Pet para Adoção
          </Link>
        </Button>
      </div>

      <PetFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name || "Pet sem nome"}
                  main_image_url={pet.main_image_url} // Passando main_image_url
                  species={pet.species}
                  species_other={pet.species_other}
                  breed={pet.breed}
                  age={pet.age}
                  size={pet.size}
                  size_other={pet.size_other}
                  gender={pet.gender}
                  gender_other={pet.gender_other}
                  city={pet.city}
                  state={pet.state}
                  status={pet.status}
                  type="adoption"
                  isSpecialNeeds={pet.is_special_needs}
                  slug={pet.slug}
                  category={pet.category}
                  created_at={pet.created_at}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Nenhum pet para adoção encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Não encontramos nenhum pet para adoção com os filtros selecionados.
              </p>
              <Button asChild>
                <Link href="/cadastrar-pet-adocao">Cadastrar Pet para Adoção</Link>
              </Button>
            </div>
          )}

          {total > itemsPerPage && (
            <div className="mt-8">
              <PaginationControls
                currentPage={page}
                totalPages={Math.ceil(total / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
