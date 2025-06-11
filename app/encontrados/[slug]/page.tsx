import { getPet } from "@/services/petService"
import PetDetails from "@/components/PetDetails"

interface Params {
  params: {
    slug: string
  }
}

export default async function PetPage({ params }: Params) {
  const { slug } = params

  const pet = await getPet(slug)

  if (!pet) {
    return <div>Pet não encontrado</div>
  }

  return <PetDetails pet={pet} />
}
