"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import PetCard from "@/components/pet-card"
import { PetFilters } from "@/components/pet-filters"
import { PaginationControls } from "@/components/pagination-controls"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface AdocaoClientPageProps {
  initialPets: any[]
  totalCount: number
  initialPage?: number
  initialFilters?: any
}

export default function AdocaoClientPage({
  initialPets,
  totalCount,
  initialPage = 1,
  initialFilters = {},
}: AdocaoClientPageProps) {
  const [pets, setPets] = useState(initialPets)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(initialPage)
  const [filters, setFilters] = useState(initialFilters)
  const [total, setTotal] = useState(totalCount)
  const supabase = createClientComponentClient()
  const itemsPerPage = 12

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from("pets")
          .select("*", { count: "exact" })
          .eq("status", "approved")

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
      } catch (error) {
        console.error("Erro ao buscar pets para adoção:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [page, filters, supabase])

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
          <Link href="/adocao/cadastrar">
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
                  image={pet.image_url}
                  species={pet.species}
                  species_other={pet.species_other}
                  breed={pet.breed}
                  age={pet.age}
                  size={pet.size}
                  size_other={pet.size_other}
                  gender={pet.gender}
                  gender_other={pet.gender_other}
                  location={pet.city && pet.state ? `${pet.city}, ${pet.state}` : null}
                  status={pet.status}
                  type="adoption"
                  isSpecialNeeds={pet.is_special_needs}
                  slug={pet.slug}
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
                <Link href="/adocao/cadastrar">Cadastrar Pet para Adoção</Link>
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
