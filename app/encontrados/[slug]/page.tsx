import { ShareButtons } from "@/components/share-buttons"
import { ReportPetButton } from "@/components/report-pet-button"
import { getPet } from "@/services/petService"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Params {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const pet = await getPet(params.slug)

  if (!pet) {
    return {
      title: "Pet não encontrado - Petadote",
    }
  }

  return {
    title: `${pet.name} foi encontrado - Petadote`,
    description: `Detalhes sobre ${pet.name}, encontrado e cadastrado no Petadote.`,
    openGraph: {
      images: [pet.imageUrl],
    },
  }
}

export default async function PetEncontrado({ params }: Params) {
  const pet = await getPet(params.slug)

  if (!pet) {
    notFound()
  }

  const currentUrl = `https://petadote.com.br/encontrados/${pet.id}`

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Image
            src={pet.imageUrl || "/placeholder.svg"}
            alt={pet.name}
            width={500}
            height={500}
            className="rounded-lg shadow-md object-cover w-full h-full"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-semibold mb-4">{pet.name}</h1>
          <p className="text-gray-600 mb-4">{pet.description}</p>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Detalhes</h2>
            <p>
              <strong>Espécie:</strong> {pet.species}
            </p>
            <p>
              <strong>Raça:</strong> {pet.breed}
            </p>
            <p>
              <strong>Sexo:</strong> {pet.gender}
            </p>
            <p>
              <strong>Tamanho:</strong> {pet.size}
            </p>
            <p>
              <strong>Cor:</strong> {pet.color}
            </p>
            <p>
              <strong>Encontrado em:</strong> {pet.location}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Compartilhe</h2>
            <div className="flex gap-2 flex-wrap">
              <ShareButtons title={`${pet.name} foi encontrado - Petadot`} url={currentUrl} />
              <ReportPetButton petId={pet.id} petName={pet.name} />
              {pet.owner && (
                <>
                  <Link
                    href={`https://wa.me/${pet.owner.phone}`}
                    target="_blank"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Entrar em contato (WhatsApp)
                  </Link>
                  <Link
                    href={`tel:${pet.owner.phone}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Ligar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
