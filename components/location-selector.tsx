"use client"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Lista estática de estados brasileiros como fallback
const ESTADOS_BRASIL = [
  { id: 12, sigla: "AC", nome: "Acre" },
  { id: 27, sigla: "AL", nome: "Alagoas" },
  { id: 16, sigla: "AP", nome: "Amapá" },
  { id: 13, sigla: "AM", nome: "Amazonas" },
  { id: 29, sigla: "BA", nome: "Bahia" },
  { id: 23, sigla: "CE", nome: "Ceará" },
  { id: 53, sigla: "DF", nome: "Distrito Federal" },
  { id: 32, sigla: "ES", nome: "Espírito Santo" },
  { id: 52, sigla: "GO", nome: "Goiás" },
  { id: 21, sigla: "MA", nome: "Maranhão" },
  { id: 51, sigla: "MT", nome: "Mato Grosso" },
  { id: 50, sigla: "MS", nome: "Mato Grosso do Sul" },
  { id: 31, sigla: "MG", nome: "Minas Gerais" },
  { id: 15, sigla: "PA", nome: "Pará" },
  { id: 25, sigla: "PB", nome: "Paraíba" },
  { id: 41, sigla: "PR", nome: "Paraná" },
  { id: 26, sigla: "PE", nome: "Pernambuco" },
  { id: 22, sigla: "PI", nome: "Piauí" },
  { id: 33, sigla: "RJ", nome: "Rio de Janeiro" },
  { id: 24, sigla: "RN", nome: "Rio Grande do Norte" },
  { id: 43, sigla: "RS", nome: "Rio Grande do Sul" },
  { id: 11, sigla: "RO", nome: "Rondônia" },
  { id: 14, sigla: "RR", nome: "Roraima" },
  { id: 42, sigla: "SC", nome: "Santa Catarina" },
  { id: 35, sigla: "SP", nome: "São Paulo" },
  { id: 28, sigla: "SE", nome: "Sergipe" },
  { id: 17, sigla: "TO", nome: "Tocantins" },
]

// Algumas cidades populares por estado como fallback
const CIDADES_POPULARES: Record<string, { id: number; nome: string }[]> = {
  SP: [
    { id: 3550308, nome: "São Paulo" },
    { id: 3509502, nome: "Campinas" },
    { id: 3548708, nome: "Santos" },
    { id: 3547809, nome: "Santo André" },
    { id: 3543402, nome: "Ribeirão Preto" },
    { id: 3529401, nome: "Osasco" },
  ],
  RJ: [
    { id: 3304557, nome: "Rio de Janeiro" },
    { id: 3303500, nome: "Niterói" },
    { id: 3301702, nome: "Duque de Caxias" },
    { id: 3304904, nome: "São Gonçalo" },
    { id: 3303302, nome: "Nova Iguaçu" },
  ],
  MG: [
    { id: 3106200, nome: "Belo Horizonte" },
    { id: 3170206, nome: "Uberlândia" },
    { id: 3131702, nome: "Juiz de Fora" },
    { id: 3118601, nome: "Contagem" },
    { id: 3127701, nome: "Governador Valadares" },
  ],
  // Adicione mais estados conforme necessário
}

interface LocationSelectorProps {
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  required?: boolean
  initialState?: string
  initialCity?: string
}

export function LocationSelector({
  onStateChange,
  onCityChange,
  required = false,
  initialState = "",
  initialCity = "",
}: LocationSelectorProps) {
  const [states, setStates] = useState<{ id: number; sigla: string; nome: string }[]>([])
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState(initialState)
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [apiError, setApiError] = useState(false)

  // Carregar estados
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true)
        setApiError(false)

        // Tentar buscar da API
        const response = await fetch("https://brasilapi.com.br/api/ibge/uf/v1")

        if (!response.ok) {
          throw new Error(`Erro ao buscar estados: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          console.log(`Carregados ${data.length} estados da API`)
          setStates(data)
        } else {
          console.warn("API retornou uma lista vazia de estados, usando fallback")
          setStates(ESTADOS_BRASIL)
          setApiError(true)
        }
      } catch (error) {
        console.error("Erro ao carregar estados:", error)
        setStates(ESTADOS_BRASIL)
        setApiError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStates()
  }, [])

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) return

      try {
        setLoading(true)
        setCities([])

        if (apiError && CIDADES_POPULARES[selectedState]) {
          // Se houve erro na API de estados, usar cidades do fallback
          console.log(`Usando cidades fallback para ${selectedState}`)
          setCities(CIDADES_POPULARES[selectedState] || [])
          setLoading(false)
          return
        }

        // Tentar buscar da API
        const response = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${selectedState}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar cidades: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          console.log(`Carregadas ${data.length} cidades para ${selectedState}`)
          setCities(data)
        } else {
          console.warn(`API retornou uma lista vazia de cidades para ${selectedState}, usando fallback`)
          setCities(CIDADES_POPULARES[selectedState] || [])
        }
      } catch (error) {
        console.error(`Erro ao carregar cidades para ${selectedState}:`, error)
        setCities(CIDADES_POPULARES[selectedState] || [])
      } finally {
        setLoading(false)
      }
    }

    if (selectedState) {
      fetchCities()
    }
  }, [selectedState, apiError])

  const handleStateChange = (value: string) => {
    console.log("Estado selecionado:", value)
    setSelectedState(value)
    setSelectedCity("")
    onStateChange(value)
    onCityChange("")
  }

  const handleCityChange = (value: string) => {
    console.log("Cidade selecionada:", value)
    setSelectedCity(value)
    onCityChange(value)
  }

  // Função para criar uma cidade personalizada
  const handleCustomCity = (cityName: string) => {
    if (!cityName.trim()) return

    const customCity = {
      id: Date.now(), // ID único baseado no timestamp
      nome: cityName.trim(),
    }

    setCities((prev) => [...prev, customCity])
    setSelectedCity(customCity.nome)
    onCityChange(customCity.nome)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state" className="text-foreground">
            Estado{required && "*"}
          </Label>
          <Select
            value={selectedState}
            onValueChange={handleStateChange}
            required={required}
            className="text-foreground bg-background"
          >
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder={loading ? "Carregando estados..." : "Selecione o estado"} />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={`state-${state.id}`} value={state.sigla}>
                  {state.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city" className="text-foreground">
            Cidade{required && "*"}
          </Label>
          <Select
            value={selectedCity}
            onValueChange={handleCityChange}
            disabled={!selectedState || loading}
            required={required}
            className="text-foreground bg-background"
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder={loading ? "Carregando cidades..." : "Selecione a cidade"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={`city-${city.id}`} value={city.nome}>
                  {city.nome}
                </SelectItem>
              ))}
              {selectedState && cities.length === 0 && !loading && (
                <SelectItem value="custom" disabled>
                  Nenhuma cidade encontrada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedState && !selectedCity && cities.length === 0 && !loading && (
        <div className="mt-2">
          <Label htmlFor="custom-city" className="text-foreground">
            Cidade não encontrada? Digite manualmente:
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="custom-city"
              placeholder="Digite o nome da cidade"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCustomCity((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ""
                }
              }}
            />
            <Button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                handleCustomCity(input.value)
                input.value = ""
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Área de depuração - remova em produção */}
      {(apiError || (selectedState && cities.length === 0 && !loading)) && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          {apiError ? (
            <p>Usando dados offline para estados e cidades. Alguns dados podem estar incompletos.</p>
          ) : (
            <p>Não foi possível carregar cidades para {selectedState}. Você pode digitar manualmente.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default LocationSelector
