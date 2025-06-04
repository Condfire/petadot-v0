"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import LocationSelectorSimple from "@/components/location-selector-simple"

interface PetFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  speciesFilter: string
  setSpeciesFilter: (value: string) => void
  sizeFilter: string
  setSizeFilter: (value: string) => void
  genderFilter: string
  setGenderFilter: (value: string) => void
  state: string
  setState: (value: string) => void
  city: string
  setCity: (value: string) => void
  clearFilters: () => void
  type: "adoption" | "lost" | "found"
}

export default function PetFilters({
  searchTerm,
  setSearchTerm,
  speciesFilter,
  setSpeciesFilter,
  sizeFilter,
  setSizeFilter,
  genderFilter,
  setGenderFilter,
  state,
  setState,
  city,
  setCity,
  clearFilters,
  type,
}: PetFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Verificar se algum filtro está ativo
  const hasActiveFilters =
    searchTerm || speciesFilter !== "all" || sizeFilter !== "all" || genderFilter !== "all" || state || city

  // Verificar se algum filtro avançado está ativo
  const hasActiveAdvancedFilters = state || city

  // Placeholder de acordo com o tipo
  const getPlaceholder = () => {
    switch (type) {
      case "adoption":
        return "Buscar pet para adoção..."
      case "lost":
        return "Buscar pet perdido..."
      case "found":
        return "Buscar pet encontrado..."
      default:
        return "Buscar pet..."
    }
  }

  return (
    <div className="flex flex-col space-y-4 mb-6">
      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={getPlaceholder()}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="species">Espécie</Label>
          <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger id="species">
              <SelectValue placeholder="Todas as espécies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as espécies</SelectItem>
              <SelectItem value="dog">Cachorro</SelectItem>
              <SelectItem value="cat">Gato</SelectItem>
              <SelectItem value="bird">Ave</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Tamanho</Label>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Todos os tamanhos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tamanhos</SelectItem>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gênero</Label>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Todos os gêneros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os gêneros</SelectItem>
              <SelectItem value="male">Macho</SelectItem>
              <SelectItem value="female">Fêmea</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros avançados */}
      <div className="w-full">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center py-2"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <span className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros avançados
            {hasActiveAdvancedFilters && <span className="ml-2 rounded-full bg-primary w-2 h-2" />}
          </span>
          {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showAdvancedFilters && (
          <div className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <h5 className="text-sm font-medium leading-none">Localização</h5>
              <LocationSelectorSimple
                onStateChange={setState}
                onCityChange={setCity}
                initialState={state}
                initialCity={city}
                label={true}
              />
            </div>

            {hasActiveAdvancedFilters && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setState("")
                    setCity("")
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros avançados
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros ativos */}
      {(state || city) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {state && (
            <div className="inline-flex items-center bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3 mr-1" />
              {state}
              <button
                onClick={() => setState("")}
                className="ml-1 hover:text-foreground focus:outline-none"
                aria-label="Remover filtro de estado"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {city && (
            <div className="inline-flex items-center bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3 mr-1" />
              {city}
              <button
                onClick={() => setCity("")}
                className="ml-1 hover:text-foreground focus:outline-none"
                aria-label="Remover filtro de cidade"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botão para limpar todos os filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-2" />
            Limpar todos os filtros
          </Button>
        </div>
      )}
    </div>
  )
}

export { PetFilters }
