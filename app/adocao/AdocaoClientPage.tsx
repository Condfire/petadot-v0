"use client"

import { useState, useEffect } from "react"
import PetCardWithVisibility from "@/components/PetCardWithVisibility"
import Pagination from "@/components/Pagination"
import Filter from "@/components/Filter"

interface AdocaoClientPageProps {
  initialPets: any[]
  currentUserId?: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
  initialFilters: any
}

export default function AdocaoClientPage({
  initialPets,
  currentUserId,
  pagination,
  initialFilters,
}: AdocaoClientPageProps) {
  const [pets, setPets] = useState(initialPets)
  const [currentPage, setCurrentPage] = useState(pagination.currentPage)
  const [totalPages, setTotalPages] = useState(pagination.totalPages)
  const [totalItems, setTotalItems] = useState(pagination.totalItems)
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    setPets(initialPets)
    setCurrentPage(pagination.currentPage)
    setTotalPages(pagination.totalPages)
    setTotalItems(pagination.totalItems)
    setFilters(initialFilters)
  }, [initialPets, pagination, initialFilters])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Implementar a lógica para buscar os pets da página correspondente
    console.log(`Página ${pageNumber}`)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    // Implementar a lógica para buscar os pets com os filtros aplicados
    console.log("Novos filtros:", newFilters)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Adote um Pet</h1>

      <Filter initialFilters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pets.map((pet) => (
          <PetCardWithVisibility key={pet.id} pet={pet} currentUserId={currentUserId} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
