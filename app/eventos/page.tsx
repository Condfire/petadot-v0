import type { Metadata } from "next"
import { EventosClientPage } from "./EventosClientPage"
import { Suspense } from "react" // Importar Suspense

export const metadata: Metadata = {
  title: "Eventos | PetaDot",
  description: "Confira os próximos eventos para pets e seus tutores.",
}

export const revalidate = 3600 // revalidar a cada hora

export default function EventosPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Eventos</h1>
      {/* Envolver EventosClientPage em Suspense */}
      <Suspense fallback={<div>Carregando eventos...</div>}>
        <EventosClientPage />
      </Suspense>
    </main>
  )
}
