import { mapPetAge, mapPetColor, mapPetGender, mapPetSize, mapPetSpecies } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PetInfoProps {
  species: string
  species_other?: string | null
  breed?: string | null
  age?: string | null
  size: string
  size_other?: string | null
  gender: string
  gender_other?: string | null
  color?: string | null
  color_other?: string | null
  is_castrated?: boolean
  is_vaccinated?: boolean
  is_special_needs?: boolean
  special_needs_description?: string | null
}

export function PetInfo({
  species,
  species_other,
  breed,
  age,
  size,
  size_other,
  gender,
  gender_other,
  color,
  color_other,
  is_castrated,
  is_vaccinated,
  is_special_needs,
  special_needs_description,
}: PetInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-semibold">Espécie:</p>
        <p>{mapPetSpecies(species, species_other)}</p>
      </div>
      {breed && (
        <div>
          <p className="font-semibold">Raça:</p>
          <p>{breed}</p>
        </div>
      )}
      <div>
        <p className="font-semibold">Idade:</p>
        <p>{mapPetAge(age)}</p>
      </div>
      <div>
        <p className="font-semibold">Porte:</p>
        <p>{mapPetSize(size, size_other)}</p>
      </div>
      <div>
        <p className="font-semibold">Gênero:</p>
        <p>{mapPetGender(gender, gender_other)}</p>
      </div>
      {color && (
        <div>
          <p className="font-semibold">Cor:</p>
          <p>{mapPetColor(color, color_other)}</p>
        </div>
      )}
      {is_castrated !== undefined && (
        <div>
          <p className="font-semibold">Castrado:</p>
          <p>{is_castrated ? "Sim" : "Não"}</p>
        </div>
      )}
      {is_vaccinated !== undefined && (
        <div>
          <p className="font-semibold">Vacinado:</p>
          <p>{is_vaccinated ? "Sim" : "Não"}</p>
        </div>
      )}
      {is_special_needs && (
        <div className="col-span-1 md:col-span-2">
          <p className="font-semibold">Necessidades Especiais:</p>
          <Badge variant="destructive">Sim</Badge>
          {special_needs_description && <p className="mt-1 text-muted-foreground">{special_needs_description}</p>}
        </div>
      )}
    </div>
  )
}
