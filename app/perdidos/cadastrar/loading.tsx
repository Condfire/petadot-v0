import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Pet Perdido</h1>
      <p className="mb-8 text-muted-foreground">Carregando formulário...</p>
      <div className="flex justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  )
}
