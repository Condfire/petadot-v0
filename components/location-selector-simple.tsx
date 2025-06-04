"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

// Lista estática de estados brasileiros
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

// Lista expandida de cidades por estado (adicionando mais cidades populares)
const CIDADES_BRASIL: Record<string, string[]> = {
  AC: [
    "Rio Branco",
    "Cruzeiro do Sul",
    "Feijó",
    "Tarauacá",
    "Sena Madureira",
    "Brasileia",
    "Epitaciolândia",
    "Xapuri",
    "Plácido de Castro",
    "Mâncio Lima",
  ],
  AL: [
    "Maceió",
    "Arapiraca",
    "Palmeira dos Índios",
    "Rio Largo",
    "Penedo",
    "Marechal Deodoro",
    "São Miguel dos Campos",
    "Coruripe",
    "Delmiro Gouveia",
    "União dos Palmares",
  ],
  AP: [
    "Macapá",
    "Santana",
    "Laranjal do Jari",
    "Oiapoque",
    "Mazagão",
    "Porto Grande",
    "Tartarugalzinho",
    "Vitória do Jari",
    "Calçoene",
    "Amapá",
  ],
  AM: [
    "Manaus",
    "Parintins",
    "Itacoatiara",
    "Manacapuru",
    "Coari",
    "Tefé",
    "Tabatinga",
    "Humaitá",
    "Maués",
    "Iranduba",
  ],
  BA: [
    "Salvador",
    "Feira de Santana",
    "Vitória da Conquista",
    "Camaçari",
    "Juazeiro",
    "Itabuna",
    "Ilhéus",
    "Jequié",
    "Lauro de Freitas",
    "Barreiras",
    "Porto Seguro",
    "Teixeira de Freitas",
    "Alagoinhas",
    "Simões Filho",
    "Paulo Afonso",
    "Eunápolis",
    "Santo Antônio de Jesus",
    "Valença",
    "Candeias",
    "Guanambi",
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
    "Pacatuba",
    "Aquiraz",
    "Russas",
    "Horizonte",
    "Aracati",
    "Cascavel",
    "Camocim",
    "Crateús",
    "Morada Nova",
    "Tianguá",
  ],
  DF: [
    "Brasília",
    "Ceilândia",
    "Taguatinga",
    "Samambaia",
    "Plano Piloto",
    "Planaltina",
    "Águas Claras",
    "Recanto das Emas",
    "Gama",
    "Guará",
    "Santa Maria",
    "Sobradinho",
    "São Sebastião",
    "Riacho Fundo",
    "Paranoá",
    "Vicente Pires",
    "Núcleo Bandeirante",
    "Brazlândia",
    "Candangolândia",
    "Cruzeiro",
  ],
  ES: [
    "Vitória",
    "Vila Velha",
    "Serra",
    "Cariacica",
    "Linhares",
    "Cachoeiro de Itapemirim",
    "São Mateus",
    "Guarapari",
    "Colatina",
    "Aracruz",
    "Viana",
    "Nova Venécia",
    "Barra de São Francisco",
    "Marataízes",
    "Santa Maria de Jetibá",
    "Castelo",
    "Itapemirim",
    "Domingos Martins",
    "Afonso Cláudio",
    "Alegre",
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
    "Catalão",
    "Jataí",
    "Planaltina",
    "Itumbiara",
    "Senador Canedo",
    "Caldas Novas",
    "Santo Antônio do Descoberto",
    "Cidade Ocidental",
    "Goianésia",
    "Mineiros",
  ],
  MA: [
    "São Luís",
    "Imperatriz",
    "Timon",
    "Caxias",
    "Codó",
    "Paço do Lumiar",
    "Açailândia",
    "Bacabal",
    "Balsas",
    "Santa Inês",
    "Barra do Corda",
    "Pinheiro",
    "São José de Ribamar",
    "Chapadinha",
    "Buriticupu",
    "Coroatá",
    "Presidente Dutra",
    "Grajaú",
    "Itapecuru Mirim",
    "Zé Doca",
  ],
  MT: [
    "Cuiabá",
    "Várzea Grande",
    "Rondonópolis",
    "Sinop",
    "Tangará da Serra",
    "Cáceres",
    "Sorriso",
    "Lucas do Rio Verde",
    "Primavera do Leste",
    "Barra do Garças",
    "Alta Floresta",
    "Pontes e Lacerda",
    "Nova Mutum",
    "Campo Verde",
    "Juína",
    "Colíder",
    "Guarantã do Norte",
    "Juara",
    "Poconé",
    "Peixoto de Azevedo",
  ],
  MS: [
    "Campo Grande",
    "Dourados",
    "Três Lagoas",
    "Corumbá",
    "Ponta Porã",
    "Naviraí",
    "Nova Andradina",
    "Aquidauana",
    "Sidrolândia",
    "Paranaíba",
    "Maracaju",
    "Coxim",
    "Amambai",
    "Rio Brilhante",
    "Chapadão do Sul",
    "Jardim",
    "Ivinhema",
    "Cassilândia",
    "Anastácio",
    "Bonito",
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
    "Sete Lagoas",
    "Divinópolis",
    "Santa Luzia",
    "Ibirité",
    "Poços de Caldas",
    "Patos de Minas",
    "Pouso Alegre",
    "Teófilo Otoni",
    "Barbacena",
    "Sabará",
    "Varginha",
    "Conselheiro Lafaiete",
    "Araguari",
    "Itabira",
    "Passos",
    "Ubá",
    "Coronel Fabriciano",
    "Muriaé",
    "Araxá",
    "Lavras",
  ],
  PA: [
    "Belém",
    "Ananindeua",
    "Santarém",
    "Marabá",
    "Castanhal",
    "Parauapebas",
    "Abaetetuba",
    "Cametá",
    "Bragança",
    "Altamira",
    "Itaituba",
    "Marituba",
    "Tucuruí",
    "Paragominas",
    "Barcarena",
    "Breves",
    "Capanema",
    "Redenção",
    "Moju",
    "Tailândia",
  ],
  PB: [
    "João Pessoa",
    "Campina Grande",
    "Santa Rita",
    "Patos",
    "Bayeux",
    "Cabedelo",
    "Cajazeiras",
    "Sousa",
    "Guarabira",
    "Sapé",
    "Mamanguape",
    "Queimadas",
    "Esperança",
    "Monteiro",
    "Pombal",
    "Solânea",
    "Catolé do Rocha",
    "Itaporanga",
    "Alagoa Grande",
    "Pedras de Fogo",
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
    "Araucária",
    "Toledo",
    "Apucarana",
    "Pinhais",
    "Campo Largo",
    "Arapongas",
    "Almirante Tamandaré",
    "Umuarama",
    "Cambé",
    "Piraquara",
    "Paranavaí",
    "Francisco Beltrão",
    "Pato Branco",
    "Cianorte",
    "Telêmaco Borba",
    "Castro",
    "Rolândia",
    "Irati",
    "União da Vitória",
    "Fazenda Rio Grande",
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
    "Igarassu",
    "São Lourenço da Mata",
    "Abreu e Lima",
    "Santa Cruz do Capibaribe",
    "Ipojuca",
    "Serra Talhada",
    "Araripina",
    "Gravatá",
    "Carpina",
    "Goiana",
  ],
  PI: [
    "Teresina",
    "Parnaíba",
    "Picos",
    "Piripiri",
    "Floriano",
    "Campo Maior",
    "Barras",
    "União",
    "Altos",
    "Pedro II",
    "Esperantina",
    "José de Freitas",
    "Oeiras",
    "São Raimundo Nonato",
    "Corrente",
    "Batalha",
    "Luzilândia",
    "Valença do Piauí",
    "Água Branca",
    "Bom Jesus",
  ],
  RJ: [
    "Rio de Janeiro",
    "São Gonçalo",
    "Duque de Caxias",
    "Nova Iguaçu",
    "Niterói",
    "Belford Roxo",
    "Campos dos Goytacazes",
    "São João de Meriti",
    "Petrópolis",
    "Volta Redonda",
    "Magé",
    "Itaboraí",
    "Macaé",
    "Cabo Frio",
    "Nova Friburgo",
    "Barra Mansa",
    "Angra dos Reis",
    "Teresópolis",
    "Mesquita",
    "Nilópolis",
    "Maricá",
    "Rio das Ostras",
    "Queimados",
    "Resende",
    "Araruama",
    "Japeri",
    "Itaguaí",
    "São Pedro da Aldeia",
    "Barra do Piraí",
    "Seropédica",
  ],
  RN: [
    "Natal",
    "Mossoró",
    "Parnamirim",
    "São Gonçalo do Amarante",
    "Ceará-Mirim",
    "Caicó",
    "Macaíba",
    "Currais Novos",
    "Açu",
    "Apodi",
    "Nova Cruz",
    "João Câmara",
    "Santa Cruz",
    "Pau dos Ferros",
    "Extremoz",
    "São José de Mipibu",
    "Macau",
    "Canguaretama",
    "Touros",
    "Areia Branca",
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
    "Alvorada",
    "Passo Fundo",
    "Sapucaia do Sul",
    "Uruguaiana",
    "Santa Cruz do Sul",
    "Cachoeirinha",
    "Bagé",
    "Bento Gonçalves",
    "Erechim",
    "Guaíba",
    "Cachoeira do Sul",
    "Santana do Livramento",
    "Esteio",
    "Ijuí",
    "Sapiranga",
    "Santo Ângelo",
    "Lajeado",
    "Alegrete",
    "Farroupilha",
    "Venâncio Aires",
  ],
  RO: [
    "Porto Velho",
    "Ji-Paraná",
    "Ariquemes",
    "Vilhena",
    "Cacoal",
    "Rolim de Moura",
    "Jaru",
    "Guajará-Mirim",
    "Pimenta Bueno",
    "Ouro Preto do Oeste",
    "Buritis",
    "Machadinho D'Oeste",
    "Nova Mamoré",
    "Espigão D'Oeste",
    "Alta Floresta D'Oeste",
    "São Miguel do Guaporé",
    "Colorado do Oeste",
    "Cerejeiras",
    "Presidente Médici",
    "Candeias do Jamari",
  ],
  RR: [
    "Boa Vista",
    "Rorainópolis",
    "Caracaraí",
    "Alto Alegre",
    "Mucajaí",
    "Cantá",
    "Pacaraima",
    "Bonfim",
    "Amajari",
    "Iracema",
    "Caroebe",
    "São João da Baliza",
    "São Luiz",
    "Normandia",
    "Uiramutã",
  ],
  SC: [
    "Florianópolis",
    "Joinville",
    "Blumenau",
    "São José",
    "Chapecó",
    "Criciúma",
    "Itajaí",
    "Lages",
    "Jaraguá do Sul",
    "Palhoça",
    "Balneário Camboriú",
    "Brusque",
    "Tubarão",
    "São Bento do Sul",
    "Caçador",
    "Concórdia",
    "Camboriú",
    "Navegantes",
    "Rio do Sul",
    "Araranguá",
    "Gaspar",
    "Biguaçu",
    "Indaial",
    "Içara",
    "Mafra",
    "Canoinhas",
    "Tijucas",
    "Videira",
    "Imbituba",
    "Xanxerê",
  ],
  SP: [
    "São Paulo",
    "Guarulhos",
    "Campinas",
    "São Bernardo do Campo",
    "Santo André",
    "Osasco",
    "São José dos Campos",
    "Ribeirão Preto",
    "Sorocaba",
    "Santos",
    "Mauá",
    "São José do Rio Preto",
    "Mogi das Cruzes",
    "Diadema",
    "Jundiaí",
    "Piracicaba",
    "Carapicuíba",
    "Bauru",
    "Itaquaquecetuba",
    "São Vicente",
    "Franca",
    "Guarujá",
    "Limeira",
    "Suzano",
    "Taubaté",
    "Praia Grande",
    "Taboão da Serra",
    "Barueri",
    "Sumaré",
    "Embu das Artes",
    "São Carlos",
    "Indaiatuba",
    "Cotia",
    "Americana",
    "Marília",
    "Jacareí",
    "Araraquara",
    "Presidente Prudente",
    "Hortolândia",
    "Rio Claro",
    "Araçatuba",
    "Ferraz de Vasconcelos",
    "Santa Bárbara d'Oeste",
    "Francisco Morato",
    "Itapevi",
    "Pindamonhangaba",
    "Itapecerica da Serra",
    "São Caetano do Sul",
    "Bragança Paulista",
    "Itapetininga",
  ],
  SE: [
    "Aracaju",
    "Nossa Senhora do Socorro",
    "Lagarto",
    "Itabaiana",
    "São Cristóvão",
    "Estância",
    "Tobias Barreto",
    "Simão Dias",
    "Capela",
    "Laranjeiras",
    "Itaporanga d'Ajuda",
    "Propriá",
    "Boquim",
    "Poço Redondo",
    "Nossa Senhora da Glória",
    "Neópolis",
    "Canindé de São Francisco",
    "Maruim",
    "Aquidabã",
    "Carmópolis",
  ],
  TO: [
    "Palmas",
    "Araguaína",
    "Gurupi",
    "Porto Nacional",
    "Paraíso do Tocantins",
    "Colinas do Tocantins",
    "Guaraí",
    "Tocantinópolis",
    "Miracema do Tocantins",
    "Dianópolis",
    "Formoso do Araguaia",
    "Araguatins",
    "Xambioá",
    "Alvorada",
    "Taguatinga",
    "Augustinópolis",
    "Pedro Afonso",
    "Miranorte",
    "Colméia",
    "Arraias",
  ],
}

interface LocationSelectorSimpleProps {
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  required?: boolean
  initialState?: string
  initialCity?: string
  className?: string
  label?: boolean
}

export default function LocationSelectorSimple({
  onStateChange,
  onCityChange,
  required = false,
  initialState = "",
  initialCity = "",
  className = "",
  label = true,
}: LocationSelectorSimpleProps) {
  const [selectedState, setSelectedState] = useState(initialState)
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [cities, setCities] = useState<string[]>([])
  const [customCity, setCustomCity] = useState("")
  const [showCustomCity, setShowCustomCity] = useState(false)

  // Atualizar cidades quando o estado mudar
  useEffect(() => {
    if (selectedState) {
      const stateCities = CIDADES_BRASIL[selectedState] || []
      setCities(stateCities)

      // Se a cidade inicial não estiver na lista, mostrar campo personalizado
      if (initialCity && !stateCities.includes(initialCity) && selectedState === initialState) {
        setCustomCity(initialCity)
        setShowCustomCity(true)
      } else {
        setShowCustomCity(false)
      }
    } else {
      setCities([])
      setShowCustomCity(false)
    }
  }, [selectedState, initialCity, initialState])

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

  const handleStateChange = (value: string) => {
    setSelectedState(value)
    setSelectedCity("")
    setCustomCity("")
    setShowCustomCity(false)
    onStateChange(value)
    onCityChange("")
  }

  const handleCityChange = (value: string) => {
    if (value === "other") {
      setShowCustomCity(true)
      setSelectedCity(value)
      // Não atualizar o valor da cidade ainda, esperar pelo input personalizado
    } else {
      setShowCustomCity(false)
      setSelectedCity(value)
      onCityChange(value)
    }
  }

  const handleCustomCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomCity(value)
    onCityChange(value)
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        {label && <Label htmlFor="state">Estado{required && "*"}</Label>}
        <Select value={selectedState} onValueChange={handleStateChange} required={required}>
          <SelectTrigger id="state" className="w-full">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_BRASIL.map((state) => (
              <SelectItem key={state.sigla} value={state.sigla}>
                {state.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        {label && <Label htmlFor="city">Cidade{required && "*"}</Label>}
        {!showCustomCity ? (
          <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedState} required={required}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder={selectedState ? "Selecione a cidade" : "Primeiro selecione o estado"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
              <SelectItem value="other">Outra cidade...</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="custom-city"
            value={customCity}
            onChange={handleCustomCityChange}
            placeholder="Digite o nome da cidade"
            required={required}
          />
        )}
      </div>
    </div>
  )
}
