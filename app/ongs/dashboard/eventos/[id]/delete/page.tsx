"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deleteEvent } from "@/app/actions/event-actions"
import { Loader2, AlertTriangle } from "lucide-react"

export default function DeleteEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteEvent(eventId)

      if (!result.success) {
        setError(result.error || "Erro ao excluir evento")
        setIsDeleting(false)
        return
      }

      // Redirecionar para o dashboard
      router.push("/ongs/dashboard?deleted=true")
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      setError("Ocorreu um erro ao excluir o evento")
      setIsDeleting(false)
    }
  }

  return (
    <div className="container py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-red-600">Excluir Evento</CardTitle>
          <CardDescription className="text-center">
            Esta ação não pode ser desfeita. O evento será permanentemente excluído.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <p className="text-center mb-4">
            Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir Evento"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
