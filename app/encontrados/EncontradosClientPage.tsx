"use client"

import { useState, useEffect } from "react"
import PetCard from "@/components/PetCard"
import { PetFilters } from "@/components/pet-filters"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Pet {
  id: string
  name?: string
  species?: string
  species_other?: string
  breed?: string
  age?: string
  size?: string
  size_other?: string
  gender?: string
  gender_other?: string
  city?: string
  state?: string
  status?: string
  main_image_url?: string
  slug?: string
  category?: string
  pet_images?: Array<{ url: string; position: number }>
  created_at?: string
}

interface EncontradosClientPageProps {
  initialPets: Pet[]
}

export default function EncontradosClientPage({ initialPets }: EncontradosClientPageProps) {
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [filteredPets, setFilteredPets] = useState<Pet[]>(initialPets)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    species: "",
    city: "",
    state: "",
    size: "",
    gender: "",
  })

  const petsPerPage = 12

  useEffect(() => {
    // Atualiza os pets quando initialPets muda (ex: navegação de página no servidor)
    setPets(initialPets)
    setFilteredPets(initialPets) // Resetar filteredPets também
    setCurrentPage(1) // Resetar página ao receber novos initialPets
  }, [initialPets])

  // Debug log dos pets recebidos
  console.log(
    "[EncontradosClientPage] Pets recebidos:",
    pets?.map((pet) => ({
      id: pet.id,
      name: pet.name,
      main_image_url: pet.main_image_url,
      slug: pet.slug,
      category: pet.category,
    })),
  )

  useEffect(() => {
    let filtered = pets

    if (filters.species) {
      filtered = filtered.filter(
        (pet) =>
          pet.species === filters.species ||
          (pet.species === "other" && pet.species_other?.toLowerCase().includes(filters.species.toLowerCase())),
      )
    }

    if (filters.city) {
      filtered = filtered.filter((pet) => pet.city?.toLowerCase().includes(filters.city.toLowerCase()))
    }

    if (filters.state) {
      filtered = filtered.filter((pet) => pet.state === filters.state)
    }

    if (filters.size) {
      filtered = filtered.filter(
        (pet) =>
          pet.size === filters.size ||
          (pet.size === "other" && pet.size_other?.toLowerCase().includes(filters.size.toLowerCase())),
      )
    }

    if (filters.gender) {
      filtered = filtered.filter((pet) => pet.gender === filters.gender)
    }

    setFilteredPets(filtered)
    setCurrentPage(1)
  }, [filters, pets])

  const totalPages = Math.ceil(filteredPets.length / petsPerPage)
  const startIndex = (currentPage - 1) * petsPerPage
  const currentPets = filteredPets.slice(startIndex, startIndex + petsPerPage)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Pets Encontrados</h1>
              <p className="text-muted-foreground">
                Ajude estes pets a encontrarem seus donos. {filteredPets.length} pets encontrados.
              </p>
            </div>
            <Link href="/encontrados/cadastrar">
              <Button className="flex items-center gap-2">
                <Plus size={20} />
                Cadastrar Pet Encontrado
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <PetFilters filters={filters} onFiltersChange={setFilters} pets={pets} />
          </div>

          {/* Results */}
          {currentPets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">Nenhum pet encontrado com os filtros selecionados.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({ species: "", city: "", state: "", size: "", gender: "" })}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <>
              {/* Pet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {currentPets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    id={pet.id}
                    name={pet.name}
                    main_image_url={pet.main_image_url}
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
                    type="found"
                    slug={pet.slug}
                    category={pet.category}
                    created_at={pet.created_at}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
