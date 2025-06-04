import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HistoriaNotFound() {
  return (
    <div className="container py-8 md:py-12">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">História não encontrada</h1>
        <p className="text-muted-foreground mb-6">A história que você está procurando não existe ou foi removida.</p>
        <Button asChild>
          <Link href="/historias">Voltar para histórias</Link>
        </Button>
      </div>
    </div>
  )
}
