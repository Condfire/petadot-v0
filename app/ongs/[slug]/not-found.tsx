import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function OngNotFound() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Search className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">ONG não encontrada</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        A ONG que você está procurando não foi encontrada ou pode ter sido removida.
      </p>
      <Button asChild>
        <Link href="/ongs">Ver todas as ONGs</Link>
      </Button>
    </div>
  )
}
