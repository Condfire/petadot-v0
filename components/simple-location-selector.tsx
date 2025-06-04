"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SimpleLocationSelectorProps {
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  required?: boolean
  initialState?: string
  initialCity?: string
}

export function SimpleLocationSelector({
  onStateChange,
  onCityChange,
  required = false,
  initialState = "",
  initialCity = "",
}: SimpleLocationSelectorProps) {
  const [state, setState] = useState(initialState || "")
  const [city, setCity] = useState(initialCity || "")

  useEffect(() => {
    // Atualizar estado e cidade quando os valores iniciais mudarem
    if (initialState && initialState !== state) {
      setState(initialState)
    }
    if (initialCity && initialCity !== city) {
      setCity(initialCity)
    }
  }, [initialState, initialCity])

  // Estados brasileiros simplificados
  const states = [
    { id: 1, sigla: "AC", nome: "Acre" },
    { id: 2, sigla: "AL", nome: "Alagoas" },
    { id: 3, sigla: "AP", nome: "Amapá" },
    { id: 4, sigla: "AM", nome: "Amazonas" },
    { id: 5, sigla: "BA", nome: "Bahia" },
    { id: 6, sigla: "CE", nome: "Ceará" },
    { id: 7, sigla: "DF", nome: "Distrito Federal" },
    { id: 8, sigla: "ES", nome: "Espírito Santo" },
    { id: 9, sigla: "GO", nome: "Goiás" },
    { id: 10, sigla: "MA", nome: "Maranhão" },
    { id: 11, sigla: "MT", nome: "Mato Grosso" },
    { id: 12, sigla: "MS", nome: "Mato Grosso do Sul" },
    { id: 13, sigla: "MG", nome: "Minas Gerais" },
    { id: 14, sigla: "PA", nome: "Pará" },
    { id: 15, sigla: "PB", nome: "Paraíba" },
    { id: 16, sigla: "PR", nome: "Paraná" },
    { id: 17, sigla: "PE", nome: "Pernambuco" },
    { id: 18, sigla: "PI", nome: "Piauí" },
    { id: 19, sigla: "RJ", nome: "Rio de Janeiro" },
    { id: 20, sigla: "RN", nome: "Rio Grande do Norte" },
    { id: 21, sigla: "RS", nome: "Rio Grande do Sul" },
    { id: 22, sigla: "RO", nome: "Rondônia" },
    { id: 23, sigla: "RR", nome: "Roraima" },
    { id: 24, sigla: "SC", nome: "Santa Catarina" },
    { id: 25, sigla: "SP", nome: "São Paulo" },
    { id: 26, sigla: "SE", nome: "Sergipe" },
    { id: 27, sigla: "TO", nome: "Tocantins" },
  ]

  // Cidades por estado (simplificado)
  const citiesByState: Record<string, { id: number; nome: string }[]> = {
    AC: [
      { id: 1, nome: "Rio Branco" },
      { id: 2, nome: "Cruzeiro do Sul" },
      { id: 3, nome: "Sena Madureira" },
    ],
    AL: [
      { id: 4, nome: "Maceió" },
      { id: 5, nome: "Arapiraca" },
      { id: 6, nome: "Palmeira dos Índios" },
    ],
    AM: [
      { id: 7, nome: "Manaus" },
      { id: 8, nome: "Parintins" },
      { id: 9, nome: "Itacoatiara" },
      { id: 10, nome: "Manacapuru" },
    ],
    AP: [
      { id: 11, nome: "Macapá" },
      { id: 12, nome: "Santana" },
      { id: 13, nome: "Laranjal do Jari" },
    ],
    BA: [
      { id: 14, nome: "Salvador" },
      { id: 15, nome: "Feira de Santana" },
      { id: 16, nome: "Vitória da Conquista" },
    ],
    CE: [
      { id: 17, nome: "Fortaleza" },
      { id: 18, nome: "Caucaia" },
      { id: 19, nome: "Juazeiro do Norte" },
    ],
    DF: [
      { id: 20, nome: "Brasília" },
      { id: 21, nome: "Ceilândia" },
      { id: 22, nome: "Taguatinga" },
    ],
    ES: [
      { id: 23, nome: "Vitória" },
      { id: 24, nome: "Vila Velha" },
      { id: 25, nome: "Serra" },
    ],
    GO: [
      { id: 26, nome: "Goiânia" },
      { id: 27, nome: "Aparecida de Goiânia" },
      { id: 28, nome: "Anápolis" },
    ],
    MA: [
      { id: 29, nome: "São Luís" },
      { id: 30, nome: "Imperatriz" },
      { id: 31, nome: "Timon" },
    ],
    MT: [
      { id: 32, nome: "Cuiabá" },
      { id: 33, nome: "Várzea Grande" },
      { id: 34, nome: "Rondonópolis" },
    ],
    MS: [
      { id: 35, nome: "Campo Grande" },
      { id: 36, nome: "Dourados" },
      { id: 37, nome: "Três Lagoas" },
    ],
    MG: [
      { id: 38, nome: "Belo Horizonte" },
      { id: 39, nome: "Uberlândia" },
      { id: 40, nome: "Contagem" },
    ],
    PA: [
      { id: 41, nome: "Belém" },
      { id: 42, nome: "Ananindeua" },
      { id: 43, nome: "Santarém" },
    ],
    PB: [
      { id: 44, nome: "João Pessoa" },
      { id: 45, nome: "Campina Grande" },
      { id: 46, nome: "Santa Rita" },
    ],
    PR: [
      { id: 47, nome: "Curitiba" },
      { id: 48, nome: "Londrina" },
      { id: 49, nome: "Maringá" },
    ],
    PE: [
      { id: 50, nome: "Recife" },
      { id: 51, nome: "Jaboatão dos Guararapes" },
      { id: 52, nome: "Olinda" },
    ],
    PI: [
      { id: 53, nome: "Teresina" },
      { id: 54, nome: "Parnaíba" },
      { id: 55, nome: "Picos" },
    ],
    RJ: [
      { id: 56, nome: "Rio de Janeiro" },
      { id: 57, nome: "São Gonçalo" },
      { id: 58, nome: "Duque de Caxias" },
    ],
    RN: [
      { id: 59, nome: "Natal" },
      { id: 60, nome: "Mossoró" },
      { id: 61, nome: "Parnamirim" },
    ],
    RS: [
      { id: 62, nome: "Porto Alegre" },
      { id: 63, nome: "Caxias do Sul" },
      { id: 64, nome: "Pelotas" },
    ],
    RO: [
      { id: 65, nome: "Porto Velho" },
      { id: 66, nome: "Ji-Paraná" },
      { id: 67, nome: "Ariquemes" },
    ],
    RR: [
      { id: 68, nome: "Boa Vista" },
      { id: 69, nome: "Caracaraí" },
      { id: 70, nome: "Rorainópolis" },
    ],
    SC: [
      { id: 71, nome: "Florianópolis" },
      { id: 72, nome: "Joinville" },
      { id: 73, nome: "Blumenau" },
    ],
    SP: [
      { id: 74, nome: "São Paulo" },
      { id: 75, nome: "Guarulhos" },
      { id: 76, nome: "Campinas" },
      { id: 77, nome: "Santos" },
    ],
    SE: [
      { id: 78, nome: "Aracaju" },
      { id: 79, nome: "Nossa Senhora do Socorro" },
      { id: 80, nome: "Lagarto" },
    ],
    TO: [
      { id: 81, nome: "Palmas" },
      { id: 82, nome: "Araguaína" },
      { id: 83, nome: "Gurupi" },
    ],
  }

  const handleStateChange = (value: string) => {
    setState(value)
    setCity("") // Limpar cidade quando o estado muda
    onStateChange(value)
    onCityChange("") // Limpar cidade no componente pai
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    onCityChange(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="simple-state" className="flex">
          Estado{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={state} onValueChange={handleStateChange} required={required}>
          <SelectTrigger id="simple-state">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {states.map((stateItem) => (
              <SelectItem key={stateItem.id} value={stateItem.sigla}>
                {stateItem.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="simple-city" className="flex">
          Cidade{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={city} onValueChange={handleCityChange} disabled={!state} required={required}>
          <SelectTrigger id="simple-city">
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {state &&
              citiesByState[state]?.map((cityItem) => (
                <SelectItem key={cityItem.id} value={cityItem.nome}>
                  {cityItem.nome}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {city && <p className="text-xs text-muted-foreground mt-1">Cidade selecionada: {city}</p>}
      </div>
    </div>
  )
}

// Exportação padrão para compatibilidade
export default SimpleLocationSelector
