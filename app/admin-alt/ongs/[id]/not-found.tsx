import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OngNotFound() {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">ONG não encontrada</h1>
      <p className="text-muted-foreground mb-8">A ONG que você está procurando não existe ou foi removida.</p>
      <Button asChild>
        <Link href="/admin-alt/ongs">Voltar para lista de ONGs</Link>
      </Button>
    </div>
  )
}
