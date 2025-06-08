"use client"

import { useState, useEffect } from "react"
import PetCard from "@/components/pet-card"
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
}

export default function EncontradosClientPage({
  pets = [],
  pagination = { total: 0, page: 1, pageSize: 12, totalPages: 0 },
}: EncontradosClientPageProps) {
  const [currentPets, setCurrentPets] = useState(pets || [])
  const [loading, setLoading] = useState(false)

  // Garantir que pets é sempre um array
  useEffect(() => {
    if (Array.isArray(pets)) {
      setCurrentPets(pets)
    } else {
      setCurrentPets([])
    }
  }, [pets])

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {Array.isArray(currentPets) && currentPets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {currentPets.map((pet) => {
                if (!pet || !pet.id) return null

                return (
                  <PetCard
                    key={pet.id}
                    id={pet.id}
                    name={pet.name || "Pet sem nome"}
                    image={pet.image_url || pet.main_image_url}
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
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Nenhum pet encontrado</h3>
              <p className="text-muted-foreground mb-6">Não há pets encontrados aprovados no momento.</p>
              <Button asChild>
                <Link href="/encontrados/cadastrar">Cadastrar Pet Encontrado</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
