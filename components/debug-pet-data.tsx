interface DebugPetDataProps {
  pet: any
  title?: string
}

export function DebugPetData({ pet, title = "Pet Data Debug" }: DebugPetDataProps) {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-xs">
      <h3 className="font-bold mb-2">{title}</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(pet, null, 2)}</pre>
    </div>
  )
}
