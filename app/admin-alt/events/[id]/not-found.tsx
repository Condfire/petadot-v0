import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EventNotFound() {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Evento não encontrado</h1>
      <p className="text-muted-foreground mb-8">O evento que você está procurando não existe ou foi removido.</p>
      <Button asChild>
        <Link href="/admin-alt/events">Voltar para lista de eventos</Link>
      </Button>
    </div>
  )
}
