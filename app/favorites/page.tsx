"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface FavoritePet {
  id: string
  pet_id: string
  created_at: string
  pets: {
    id: string
    name: string
    species: string
    breed: string
    main_image_url: string
    category: string
    slug: string
    city: string
    state: string
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePet[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      fetchFavorites(session.user.id)
    } else {
      setLoading(false)
    }
  }

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          pet_id,
          created_at,
          pets (
            id,
            name,
            species,
            breed,
            main_image_url,
            category,
            slug,
            city,
            state
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar favoritos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus favoritos.",
          variant: "destructive",
        })
      } else {
        setFavorites(data || [])
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover dos favoritos.",
          variant: "destructive",
        })
      } else {
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
        toast({
          title: "Removido",
          description: "Pet removido dos favoritos.",
        })
      }
    } catch (error) {
      console.error("Erro ao remover favorito:", error)
    }
  }

  const getPetUrl = (pet: any) => {
    const baseUrl =
      {
        adoption: "/adocao/",
        lost: "/perdidos/",
        found: "/encontrados/",
      }[pet.category] || "/adocao/"

    return `${baseUrl}${pet.slug || pet.id}`
  }

  const getSpeciesText = (species: string) => {
    const speciesMap: Record<string, string> = {
      dog: "Cachorro",
      cat: "Gato",
      bird: "Pássaro",
      rabbit: "Coelho",
      other: "Outro",
    }
    return speciesMap[species] || species
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Você precisa estar logado para ver seus favoritos.</p>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Meus Favoritos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Meus Favoritos</h1>
      </div>

      {favorites.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground mb-4">Comece a favoritar pets que você tem interesse em adotar!</p>
            <Button asChild>
              <Link href="/adocao">Explorar Pets</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={favorite.pets.main_image_url || "/placeholder.svg?height=300&width=300&query=pet"}
                  alt={favorite.pets.name}
                  fill
                  className="object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeFavorite(favorite.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{favorite.pets.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <p>
                    <span className="font-medium">Espécie:</span> {getSpeciesText(favorite.pets.species)}
                  </p>
                  {favorite.pets.breed && (
                    <p>
                      <span className="font-medium">Raça:</span> {favorite.pets.breed}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Localização:</span> {favorite.pets.city}, {favorite.pets.state}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href={getPetUrl(favorite.pets)}>Ver Detalhes</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
