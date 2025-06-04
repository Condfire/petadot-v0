import { Check, X } from "lucide-react"

interface PetCharacteristicsProps {
  isVaccinated?: boolean
  isNeutered?: boolean
  isSpecialNeeds?: boolean
  specialNeedsDescription?: string | null
  goodWithKids?: boolean
  goodWithCats?: boolean
  goodWithDogs?: boolean
  className?: string
}

export function PetCharacteristics({
  isVaccinated,
  isNeutered,
  isSpecialNeeds,
  specialNeedsDescription,
  goodWithKids,
  goodWithCats,
  goodWithDogs,
  className,
}: PetCharacteristicsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <CharacteristicItem label="Vacinado" value={isVaccinated} />
          <CharacteristicItem label="Castrado" value={isNeutered} />
          <CharacteristicItem label="Necessidades Especiais" value={isSpecialNeeds} />
          {isSpecialNeeds && specialNeedsDescription && (
            <div className="ml-6 mt-1 text-sm">
              <p className="text-muted-foreground">{specialNeedsDescription}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <CharacteristicItem label="Bom com crianças" value={goodWithKids} />
          <CharacteristicItem label="Bom com gatos" value={goodWithCats} />
          <CharacteristicItem label="Bom com cães" value={goodWithDogs} />
        </div>
      </div>
    </div>
  )
}

function CharacteristicItem({ label, value }: { label: string; value?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
      <span>{label}</span>
    </div>
  )
}
