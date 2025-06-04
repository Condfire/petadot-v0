import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import AdoptionPetFormContainer from "./form-container"

export const metadata: Metadata = {
  title: "Cadastrar Pet para Adoção | Petadot",
  description: "Cadastre um pet para adoção e ajude-o a encontrar um novo lar.",
}

export default function CadastrarPetAdocaoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Pet para Adoção</h1>
      <p className="mb-8 text-muted-foreground">
        Preencha o formulário abaixo com os dados do pet para adoção. Quanto mais informações você fornecer, maiores
        serão as chances de encontrar um novo lar para ele.
      </p>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AdoptionPetFormContainer />
      </Suspense>
    </div>
  )
}
