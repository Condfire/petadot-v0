"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import PetCard from "@/components/pet-card"
import { PetFilters } from "@/components/pet-filters"
import { PaginationControls } from "@/components/pagination-controls"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface EncontradosClientPageProps {
  pets: any[]
  pagination?: {
    total?: number
    page?: number
    pageSize?: number
    totalPages?: number
  }
  initialFilters?: any
}

export default function EncontradosClientPage({
  pets = [],
  pagination = { total: 0, page: 1, pageSize: 12, totalPages: 0 },
  initialFilters = {},
}: EncontradosClientPageProps) {
  const [currentPets, setCurrentPets] = useState(pets)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(pagination.page || 1)
  const [filters, setFilters] = useState(initialFilters)
  const [total, setTotal] = useState(pagination.total || 0)
  const supabase = createClientComponentClient()
  const itemsPerPage = pagination.pageSize || 12

  // Estado para os filtros individuais
  const [searchTerm, setSearchTerm] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from("pets_found")
          .select("*", { count: "exact" })
          .eq("status", "approved")

        // Aplicar filtros
        if (filters.species && filters.species !== "all") {
          query = query.eq("species", filters.species)
        }
        if (filters.size && filters.size !== "all") {
          query = query.eq("size", filters.size)
        }
        if (filters.gender && filters.gender !== "all") {
          query = query.eq("gender", filters.gender)
        }
        if (filters.state) {
          query = query.eq("state", filters.state)
        }
        if (filters.city) {
          query = query.eq("city", filters.city)
        }
        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,found_location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
          )
        }

        // Paginação
        const from = (page - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to).order("created_at", { ascending: false })

        const { data, count, error } = await query

        if (error) {
          throw error
        }

        setCurrentPets(data || [])
        if (count !== null) {
          setTotal(count)
        }
      } catch (error) {
        console.error("Erro ao buscar pets encontrados:", error)
      } finally {
        setLoading(false)
      }
    }

    // Se houver filtros ativos ou mudança de página, buscar novamente
    if (Object.keys(filters).length > 0 || page > 1) {
      fetchPets()
    }
  }, [page, filters, supabase, itemsPerPage])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1) // Resetar para a primeira página ao mudar filtros
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm("")
    setSpeciesFilter("all")
    setSizeFilter("all")
    setGenderFilter("all")
    setState("")
    setCity("")
    setFilters({})
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Pets Encontrados</h1>
        <Button asChild>
          <Link href="/encontrados/cadastrar">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Pet Encontrado
          </Link>
        </Button>
      </div>

      <PetFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        speciesFilter={speciesFilter}
        setSpeciesFilter={setSpeciesFilter}
        sizeFilter={sizeFilter}
        setSizeFilter={setSizeFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        state={state}
        setState={setState}
        city={city}
        setCity={setCity}
        clearFilters={clearFilters}
        type="found"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {currentPets && currentPets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {currentPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name || "Pet sem nome"}
                  image={pet.main_image_url || pet.image_url}
                  species={pet.species}
                  species_other={pet.species_other}
                  breed={pet.breed}
                  size={pet.size}
                  size_other={pet.size_other}
                  gender={pet.gender}
                  gender_other={pet.gender_other}
                  location={pet.city && pet.state ? `${pet.city}, ${pet.state}` : pet.found_location}
                  status={pet.status}
                  type="found"
                  isSpecialNeeds={pet.is_special_needs}
                  slug={pet.slug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Não encontramos nenhum pet encontrado com os filtros selecionados.
              </p>
              <Button asChild>
                <Link href="/encontrados/cadastrar">Cadastrar Pet Encontrado</Link>
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
