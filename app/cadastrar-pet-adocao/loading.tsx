import { Loader2 } from "lucide-react"

export default function CadastrarPetAdocaoLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando formulário de cadastro...</p>
      </div>
    </div>
  )
}
