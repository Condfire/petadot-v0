import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import FormContainer from "./form-container"

export const metadata: Metadata = {
  title: "Cadastrar Pet Perdido | Petadot",
  description: "Cadastre um pet perdido e aumente as chances de encontrá-lo.",
}

export default function CadastrarPetPerdidoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Pet Perdido</h1>
      <p className="mb-8 text-muted-foreground">
        Preencha o formulário abaixo com os dados do seu pet perdido. Quanto mais informações você fornecer, maiores
        serão as chances de encontrá-lo.
      </p>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <FormContainer />
      </Suspense>
    </div>
  )
}
