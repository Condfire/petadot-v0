import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface PetCardProps {
  id: string
  name?: string
  image?: string
  main_image_url?: string
  species?: string
  species_other?: string
  breed?: string
  age?: string
  size?: string
  size_other?: string
  gender?: string
  gender_other?: string
  location?: string
  status?: string
  type: "adoption" | "lost" | "found"
  isSpecialNeeds?: boolean
  slug?: string
}

export default function PetCard({
  id,
  name,
  image,
  main_image_url,
  species,
  species_other,
  breed,
  age,
  size,
  size_other,
  gender,
  gender_other,
  location,
  status,
  type,
  isSpecialNeeds,
  slug,
}: PetCardProps) {
  // Determinar a URL de destino com base no tipo de pet
  const getDetailUrl = () => {
    const baseUrl = {
      adoption: "/adocao/",
      lost: "/perdidos/",
      found: "/encontrados/",
    }[type]

    // Usar slug se disponível, caso contrário usar id
    return `${baseUrl}${slug || id}`
  }

  // Função para obter a imagem com fallback
  const getImageSrc = () => {
    if (main_image_url && main_image_url.trim() !== "") {
      return main_image_url
    }
    if (image && image.trim() !== "") {
      return image
    }
    return "/placeholder.svg?height=300&width=300"
  }

  // Mapear espécie para texto legível
  const getSpeciesText = () => {
    if (species === "other" && species_other) {
      return species_other
    }

    const speciesMap: Record<string, string> = {
      dog: "Cachorro",
      cat: "Gato",
      bird: "Pássaro",
      rabbit: "Coelho",
      hamster: "Hamster",
      fish: "Peixe",
      turtle: "Tartaruga",
      other: "Outro",
    }

    return speciesMap[species || ""] || species || "Não informado"
  }

  // Mapear tamanho para texto legível
  const getSizeText = () => {
    if (size === "other" && size_other) {
      return size_other
    }

    const sizeMap: Record<string, string> = {
      small: "Pequeno",
      medium: "Médio",
      large: "Grande",
      giant: "Gigante",
    }

    return sizeMap[size || ""] || size || "Não informado"
  }

  // Mapear gênero para texto legível
  const getGenderText = () => {
    if (gender === "other" && gender_other) {
      return gender_other
    }

    const genderMap: Record<string, string> = {
      male: "Macho",
      female: "Fêmea",
      unknown: "Não informado",
      other: "Outro",
    }

    return genderMap[gender || ""] || gender || "Não informado"
  }

  // Mapear status para texto legível
  const getStatusText = () => {
    const statusMap: Record<string, { text: string; color: string }> = {
      available: { text: "Disponível", color: "bg-green-500" },
      pending: { text: "Pendente", color: "bg-yellow-500" },
      adopted: { text: "Adotado", color: "bg-blue-500" },
      approved: { text: "Aprovado", color: "bg-green-500" },
      rejected: { text: "Rejeitado", color: "bg-red-500" },
      resolved: { text: "Encontrado", color: "bg-blue-500" },
      reunited: { text: "Reunido", color: "bg-blue-500" },
    }

    return statusMap[status || ""] || { text: status || "Desconhecido", color: "bg-gray-500" }
  }

  const statusInfo = getStatusText()
  const imageSrc = getImageSrc()

  return (
    <Link href={getDetailUrl()}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
        <div className="relative aspect-square">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={name || "Pet"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            unoptimized={imageSrc.includes("placeholder.svg")}
          />
          {isSpecialNeeds && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-full">
              <AlertTriangle size={16} />
            </div>
          )}
          {status && (
            <Badge
              className={`absolute top-2 left-2 ${statusInfo.color} hover:${statusInfo.color} text-white border-none`}
            >
              {statusInfo.text}
            </Badge>
          )}
        </div>
        <CardContent className="flex-grow p-4">
          <h3 className="font-bold text-lg mb-2 truncate">{name || "Pet sem nome"}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Espécie:</span> {getSpeciesText()}
            </p>
            {breed && (
              <p>
                <span className="font-medium">Raça:</span> {breed}
              </p>
            )}
            {age && (
              <p>
                <span className="font-medium">Idade:</span> {age}
              </p>
            )}
            {size && (
              <p>
                <span className="font-medium">Porte:</span> {getSizeText()}
              </p>
            )}
            {gender && (
              <p>
                <span className="font-medium">Gênero:</span> {getGenderText()}
              </p>
            )}
            {location && (
              <p>
                <span className="font-medium">Localização:</span> {location}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
