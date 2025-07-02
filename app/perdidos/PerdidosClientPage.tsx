"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  color: string
  description: string
  city: string
  state: string
  contact_name: string
  contact_phone: string
  contact_whatsapp: string
  created_at: string
  slug: string
  main_image_url?: string
  pet_images?: Array<{
    url: string
    position: number
  }>
}

interface PerdidosClientPageProps {
  initialPets: Pet[]
}

export default function PerdidosClientPage({ initialPets }: PerdidosClientPageProps) {
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState("")

  const supabase = createClient()

  const fetchPets = async () => {
    setLoading(true)

    let query = supabase
      .from("pets")
      .select(`
        *,
        pet_images (
          url,
          position
        )
      `)
      .eq("category", "lost")
      .eq("status", "approved")

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`)
    }

    if (selectedState) {
      query = query.eq("state", selectedState)
    }

    if (selectedCity) {
      query = query.eq("city", selectedCity)
    }

    if (selectedSpecies) {
      query = query.eq("species", selectedSpecies)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar pets perdidos:", error)
    } else {
      setPets(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPets()
  }, [searchTerm, selectedState, selectedCity, selectedSpecies])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getMainImage = (pet: Pet) => {
    if (pet.main_image_url) return pet.main_image_url
    if (pet.pet_images && pet.pet_images.length > 0) {
      return pet.pet_images.sort((a, b) => a.position - b.position)[0].url
    }
    return "/placeholder.svg?height=300&width=300&text=Sem+foto"
  }

  const formatWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    return `https://wa.me/55${cleanPhone}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pets Perdidos</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ajude a reunir famílias! Veja os pets que estão perdidos e compartilhe para aumentar as chances de
              reencontro.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por nome, raça ou cor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger>
                <SelectValue placeholder="Espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as espécies</SelectItem>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Cidade" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando pets perdidos...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Nenhum pet perdido encontrado com os filtros selecionados.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedState("")
                setSelectedCity("")
                setSelectedSpecies("")
              }}
              variant="outline"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <Image src={getMainImage(pet) || "/placeholder.svg"} alt={pet.name} fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">PERDIDO</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pet.name}</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {pet.city}, {pet.state}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">Perdido em {formatDate(pet.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Espécie:</span>
                      <span className="text-sm font-medium">
                        {pet.species === "dog" ? "Cachorro" : pet.species === "cat" ? "Gato" : "Outro"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Raça:</span>
                      <span className="text-sm font-medium">{pet.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Cor:</span>
                      <span className="text-sm font-medium">{pet.color}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{pet.description}</p>

                  <div className="space-y-2">
                    <Link href={`/perdidos/${pet.slug}`}>
                      <Button className="w-full" variant="outline">
                        Ver detalhes
                      </Button>
                    </Link>

                    {pet.contact_whatsapp && (
                      <a
                        href={formatWhatsApp(pet.contact_whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Phone className="h-4 w-4 mr-2" />
                          Entrar em contato
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
