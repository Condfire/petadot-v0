"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface LocationSelectorProps {
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  initialState?: string
  initialCity?: string
}

const STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
]

const CITIES_BY_STATE: Record<string, string[]> = {
  SP: [
    "São Paulo",
    "Campinas",
    "Santos",
    "Ribeirão Preto",
    "Sorocaba",
    "São José dos Campos",
    "Osasco",
    "Santo André",
    "São Bernardo do Campo",
    "Guarulhos",
  ],
  RJ: [
    "Rio de Janeiro",
    "Niterói",
    "Nova Iguaçu",
    "Duque de Caxias",
    "São Gonçalo",
    "Volta Redonda",
    "Petrópolis",
    "Magé",
    "Itaboraí",
    "Cabo Frio",
  ],
  MG: [
    "Belo Horizonte",
    "Uberlândia",
    "Contagem",
    "Juiz de Fora",
    "Betim",
    "Montes Claros",
    "Ribeirão das Neves",
    "Uberaba",
    "Governador Valadares",
    "Ipatinga",
  ],
  PR: [
    "Curitiba",
    "Londrina",
    "Maringá",
    "Ponta Grossa",
    "Cascavel",
    "São José dos Pinhais",
    "Foz do Iguaçu",
    "Colombo",
    "Guarapuava",
    "Paranaguá",
  ],
  RS: [
    "Porto Alegre",
    "Caxias do Sul",
    "Pelotas",
    "Canoas",
    "Santa Maria",
    "Gravataí",
    "Viamão",
    "Novo Hamburgo",
    "São Leopoldo",
    "Rio Grande",
  ],
  SC: [
    "Florianópolis",
    "Joinville",
    "Blumenau",
    "São José",
    "Criciúma",
    "Chapecó",
    "Itajaí",
    "Lages",
    "Jaraguá do Sul",
    "Palhoça",
  ],
  BA: [
    "Salvador",
    "Feira de Santana",
    "Vitória da Conquista",
    "Camaçari",
    "Itabuna",
    "Juazeiro",
    "Lauro de Freitas",
    "Ilhéus",
    "Jequié",
    "Teixeira de Freitas",
  ],
  GO: [
    "Goiânia",
    "Aparecida de Goiânia",
    "Anápolis",
    "Rio Verde",
    "Luziânia",
    "Águas Lindas de Goiás",
    "Valparaíso de Goiás",
    "Trindade",
    "Formosa",
    "Novo Gama",
  ],
  PE: [
    "Recife",
    "Jaboatão dos Guararapes",
    "Olinda",
    "Caruaru",
    "Petrolina",
    "Paulista",
    "Cabo de Santo Agostinho",
    "Camaragibe",
    "Garanhuns",
    "Vitória de Santo Antão",
  ],
  CE: [
    "Fortaleza",
    "Caucaia",
    "Juazeiro do Norte",
    "Maracanaú",
    "Sobral",
    "Crato",
    "Itapipoca",
    "Maranguape",
    "Iguatu",
    "Quixadá",
  ],
}

export function LocationSelector({ onStateChange, onCityChange, initialState, initialCity }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState(initialState || "")
  const [selectedCity, setSelectedCity] = useState(initialCity || "")
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    if (selectedState) {
      setCities(CITIES_BY_STATE[selectedState] || [])
      if (!CITIES_BY_STATE[selectedState]?.includes(selectedCity)) {
        setSelectedCity("")
        onCityChange("")
      }
    } else {
      setCities([])
      setSelectedCity("")
      onCityChange("")
    }
  }, [selectedState, selectedCity, onCityChange])

  const handleStateChange = (state: string) => {
    setSelectedState(state)
    onStateChange(state)
    setSelectedCity("")
    onCityChange("")
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    onCityChange(city)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="state">Estado (UF) *</Label>
        <Select onValueChange={handleStateChange} value={selectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name} ({state.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Cidade *</Label>
        <Select onValueChange={handleCityChange} value={selectedCity} disabled={!selectedState}>
          <SelectTrigger>
            <SelectValue placeholder={selectedState ? "Selecione a cidade" : "Primeiro selecione o estado"} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
