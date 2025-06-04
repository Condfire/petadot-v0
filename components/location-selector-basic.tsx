"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"

// Lista estática de estados brasileiros
const ESTADOS_BRASIL = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
]

// Lista simplificada de cidades por estado
const CIDADES_BRASIL: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Feijó", "Tarauacá", "Sena Madureira"],
  AL: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
  DF: ["Brasília", "Ceilândia", "Taguatinga", "Samambaia", "Plano Piloto"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"],
  MA: ["São Luís", "Imperatriz", "Timon", "Caxias", "Codó"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Ceará-Mirim"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
}

interface LocationSelectorBasicProps {
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  required?: boolean
  initialState?: string
  initialCity?: string
  className?: string
  label?: boolean
}

export default function LocationSelectorBasic({
  onStateChange,
  onCityChange,
  required = false,
  initialState = "",
  initialCity = "",
  className = "",
  label = true,
}: LocationSelectorBasicProps) {
  const [selectedState, setSelectedState] = useState(initialState)
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [cities, setCities] = useState<string[]>([])

  // Atualizar cidades quando o estado mudar
  useEffect(() => {
    if (selectedState) {
      const stateCities = CIDADES_BRASIL[selectedState] || []
      setCities(stateCities)
    } else {
      setCities([])
    }
  }, [selectedState])

  // Inicializar com os valores iniciais
  useEffect(() => {
    if (initialState) {
      setSelectedState(initialState)
      onStateChange(initialState)
    }
    if (initialCity) {
      setSelectedCity(initialCity)
      onCityChange(initialCity)
    }
  }, [initialState, initialCity, onStateChange, onCityChange])

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedState(value)
    setSelectedCity("")
    onStateChange(value)
    onCityChange("")
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCity(value)
    onCityChange(value)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        {label && (
          <Label htmlFor="state" className="mb-2 block">
            Estado{required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <select
          id="state"
          value={selectedState}
          onChange={handleStateChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione o estado</option>
          {ESTADOS_BRASIL.map((state) => (
            <option key={state.sigla} value={state.sigla}>
              {state.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        {label && (
          <Label htmlFor="city" className="mb-2 block">
            Cidade{required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <select
          id="city"
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">{selectedState ? "Selecione a cidade" : "Primeiro selecione o estado"}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
