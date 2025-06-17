import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PetInfoCardProps {
  species?: string | null
  breed?: string | null
  age?: string | null
  gender?: string | null
  size?: string | null
  color?: string | null
  location?: string | null
}

export function PetInfoCardSafe({ species, breed, age, gender, size, color, location }: PetInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Pet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {species && (
          <div className="flex justify-between">
            <span className="font-medium">Espécie:</span>
            <span>{species}</span>
          </div>
        )}
        {breed && (
          <div className="flex justify-between">
            <span className="font-medium">Raça:</span>
            <span>{breed}</span>
          </div>
        )}
        {age && (
          <div className="flex justify-between">
            <span className="font-medium">Idade:</span>
            <span>{age}</span>
          </div>
        )}
        {gender && (
          <div className="flex justify-between">
            <span className="font-medium">Gênero:</span>
            <span>{gender}</span>
          </div>
        )}
        {size && (
          <div className="flex justify-between">
            <span className="font-medium">Porte:</span>
            <span>{size}</span>
          </div>
        )}
        {color && (
          <div className="flex justify-between">
            <span className="font-medium">Cor:</span>
            <span>{color}</span>
          </div>
        )}
        {location && (
          <div className="flex justify-between">
            <span className="font-medium">Localização:</span>
            <span>{location}</span>
          </div>
        )}
        {!species && !breed && !age && !gender && !size && !color && !location && (
          <p className="text-muted-foreground">Informações não disponíveis</p>
        )}
      </CardContent>
    </Card>
  )
}
