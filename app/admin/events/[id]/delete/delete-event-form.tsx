"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, AlertTriangleIcon, CheckIcon, Loader2Icon, CalendarIcon, MapPinIcon } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

export function AdminDeleteEventForm({ event }: { event: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      // Excluir o evento
      const { error } = await supabase.from("events").delete().eq("id", event.id)

      if (error) {
        console.error("Erro ao excluir evento:", error)
        setError("Erro ao excluir evento: " + error.message)
        setIsDeleting(false)
        return
      }

      // Sucesso!
      setIsDeleted(true)
      toast.success("Evento excluído com sucesso!")

      // Atualiza a lista de eventos
      router.refresh()

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin/events")
      }, 2000)
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      setError("Erro ao excluir evento")
      setIsDeleting(false)
    }
  }

  if (isDeleted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckIcon className="h-5 w-5" />
              Evento excluído com sucesso
            </CardTitle>
            <CardDescription className="text-center">
              O evento foi removido com sucesso. Você será redirecionado em instantes...
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/admin/events">Voltar para a lista de eventos</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${event.id}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Excluir Evento</h1>
      </div>

      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangleIcon className="h-5 w-5" />
              Confirmação de Exclusão
            </CardTitle>
            <CardDescription className="text-center">
              Você está prestes a excluir permanentemente o evento:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">{event.name}</h2>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mt-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(event.start_date)}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MapPinIcon className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
              <p className="text-sm">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O evento será removido permanentemente do
                sistema.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleDelete} variant="destructive" className="w-full" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                </>
              ) : (
                "Confirmar Exclusão"
              )}
            </Button>
            <Button variant="outline" className="w-full" asChild disabled={isDeleting}>
              <Link href={`/admin/events/${event.id}`}>Cancelar</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
