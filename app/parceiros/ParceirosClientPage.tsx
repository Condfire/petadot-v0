"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PartnerCard } from "@/components/partner-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/pagination-controls"

interface ParceirosClientPageProps {
  initialPartners: any[]
  totalPartners: number
  currentPage: number
  pageSize: number
  initialFilters: any
}

export default function ParceirosClientPage({
  initialPartners = [],
  totalPartners = 0,
  currentPage = 1,
  pageSize = 12,
  initialFilters = {},
}: ParceirosClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState(initialFilters.name || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (name) params.set("name", name)
    params.set("page", "1") // Reset to first page on filter change

    router.push(`/parceiros?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setName("")
    router.push("/parceiros")
  }

  return (
    <div>
      <div className="bg-secondary p-4 rounded-lg shadow mb-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">
              Nome do Parceiro
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Buscar por nome" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFilter}>Aplicar Filtros</Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      {initialPartners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Nenhum parceiro encontrado. Tente ajustar os filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>

          <PaginationControls
            totalItems={totalPartners}
            pageSize={pageSize}
            currentPage={currentPage}
            baseUrl="/parceiros"
          />
        </>
      )}
    </div>
  )
}
