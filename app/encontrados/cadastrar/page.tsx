import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import FoundPetFormContainer from "./form-container"

export const metadata: Metadata = {
  title: "Reportar Pet Encontrado | Petadot",
  description: "Reporte um pet encontrado e ajude a encontrar seu dono.",
}

export default function CadastrarPetEncontradoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reportar Pet Encontrado</h1>
      <p className="mb-8 text-muted-foreground">
        Preencha o formulário abaixo com os dados do pet encontrado. Quanto mais informações você fornecer, maiores
        serão as chances de encontrar o dono.
      </p>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <FoundPetFormContainer />
      </Suspense>
    </div>
  )
}
