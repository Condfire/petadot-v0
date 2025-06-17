"use client"

import { useEffect, useState } from "react"
import type { Pet } from "@/app/pet/Pet"
import { PetCard } from "@/components/PetCard"
import { Pagination } from "@/components/Pagination"
import { useSearchParams } from "next/navigation"

const ITEMS_PER_PAGE = 12

async function getPets(page: number): Promise<Pet[]> {
  const offset = (page - 1) * ITEMS_PER_PAGE
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets?limit=${ITEMS_PER_PAGE}&offset=${offset}`)

  if (!res.ok) {
    throw new Error("Failed to fetch pets")
  }

  return res.json()
}

async function getTotalPets(): Promise<number> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/count`)

  if (!res.ok) {
    throw new Error("Failed to fetch total pets count")
  }

  const data = await res.json()
  return data.count
}

export default function AdocaoClientPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchParams = useSearchParams()

  useEffect(() => {
    const page = searchParams.get("page")
    if (page) {
      setCurrentPage(Number.parseInt(page))
    }
  }, [searchParams])

  useEffect(() => {
    async function loadPets() {
      const pets = await getPets(currentPage)
      setPets(pets)

      // No início do componente, adicionar log dos pets
      console.log(
        "[AdocaoClientPage] Pets recebidos:",
        pets?.map((pet) => ({
          id: pet.id,
          name: pet.name,
          main_image_url: pet.main_image_url,
          slug: pet.slug,
          category: pet.category,
        })),
      )
    }

    loadPets()
  }, [currentPage])

  useEffect(() => {
    async function loadTotalPets() {
      const totalPets = await getTotalPets()
      setTotalPages(Math.ceil(totalPets / ITEMS_PER_PAGE))
    }

    loadTotalPets()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Adote um Pet</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
