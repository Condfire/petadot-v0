import { Calendar, MapPin, Tag } from "lucide-react"

interface PetInfoCardProps {
  species: string
  breed?: string | null
  age?: string | null
  gender?: string | null
  size?: string | null
  color?: string | null
  location?: string | null
  date?: string
  className?: string
}

export function PetInfoCard({ species, breed, age, gender, size, color, location, date, className }: PetInfoCardProps) {
  return (
    <div className={`bg-muted p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Informações do Pet</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <InfoItem label="Espécie" value={species} />
          {breed && <InfoItem label="Raça" value={breed} />}
          {age && <InfoItem label="Idade" value={age} />}
          {gender && <InfoItem label="Gênero" value={gender} />}
        </div>

        <div className="space-y-2">
          {size && <InfoItem label="Porte" value={size} />}
          {color && <InfoItem label="Cor" value={color} />}
          {location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Localização:</span>
                <p className="text-sm">{location}</p>
              </div>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Data:</span> {date}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Tag className="h-5 w-5 text-muted-foreground" />
      <div>
        <span className="font-medium">{label}:</span> {value}
      </div>
    </div>
  )
}
