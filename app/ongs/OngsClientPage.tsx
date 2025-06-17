"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { OngCard } from "@/components/ong-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/pagination-controls"
import { LocationSelector } from "@/components/location-selector"

interface OngsClientPageProps {
  initialOngs: any[]
  totalOngs: number
  currentPage: number
  pageSize: number
  initialFilters: any
}

export default function OngsClientPage({
  initialOngs = [],
  totalOngs = 0,
  currentPage = 1,
  pageSize = 12,
  initialFilters = {},
}: OngsClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState(initialFilters.name || "")
  const [city, setCity] = useState(initialFilters.city || "")
  const [state, setState] = useState(initialFilters.state || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (name) params.set("name", name)
    if (city) params.set("city", city)
    if (state) params.set("state", state)
    params.set("page", "1") // Reset to first page on filter change

    router.push(`/ongs?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setName("")
    setCity("")
    setState("")
    router.push("/ongs")
  }

  return (
    <div>
      <div className="bg-secondary p-4 rounded-lg shadow mb-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">
              Nome da ONG
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Buscar por nome" />
          </div>

          <LocationSelector selectedState={state} selectedCity={city} onStateChange={setState} onCityChange={setCity} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFilter}>Aplicar Filtros</Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      {initialOngs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Nenhuma ONG encontrada. Tente ajustar os filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialOngs.map((ong) => (
              <OngCard
                key={ong.id}
                id={ong.id}
                name={ong.name}
                logo={ong.logo_url || "/placeholder-logo.png"} // Use logo_url
                city={ong.city}
                state={ong.state}
                contact={ong.contact_whatsapp || ong.contact_email || "N/A"} // Use contact_whatsapp
                petCount={0} // Placeholder for now, as pet count requires a separate query
                slug={ong.slug} // Pass the slug
              />
            ))}
          </div>

          <PaginationControls totalItems={totalOngs} pageSize={pageSize} currentPage={currentPage} baseUrl="/ongs" />
        </>
      )}
    </div>
  )
}
