"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteOng } from "@/app/actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, AlertTriangleIcon, CheckIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

export function AdminDeleteOngForm({
  ong,
  petCount,
  eventCount,
}: {
  ong: any
  petCount: number
  eventCount: number
}) {
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await deleteOng(ong.id)

        if (result.success) {
          setIsDeleted(true)
          toast.success("ONG excluída com sucesso!")

          router.refresh()

          setTimeout(() => {
            router.push("/admin/ongs")
          }, 2000)
        } else {
          setError(result.error || "Erro ao excluir ONG")
        }
      } catch (err) {
        console.error("Erro ao excluir ONG:", err)
        setError("Erro ao excluir ONG")
      }
    })
  }

  if (isDeleted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckIcon className="h-5 w-5" />
              ONG excluída com sucesso
            </CardTitle>
            <CardDescription className="text-center">
              A ONG foi removida com sucesso. Você será redirecionado em instantes...
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="mt-2" asChild>
              <Link href="/admin/ongs">Voltar para a lista de ONGs</Link>
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
          <Link href={`/admin/ongs/${ong.id}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Excluir ONG</h1>
      </div>

      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangleIcon className="h-5 w-5" />
              Confirmação de Exclusão
            </CardTitle>
            <CardDescription className="text-center">
              Você está prestes a excluir permanentemente a ONG:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">{ong.name}</h2>
              <p className="text-muted-foreground">
                {ong.city}, {ong.state}
              </p>
              <p className="text-muted-foreground">Email: {ong.contact_email}</p>
              {petCount > 0 && (
                <p className="mt-2 font-medium text-red-600">
                  Esta ONG possui {petCount} {petCount === 1 ? "pet cadastrado" : "pets cadastrados"} que também serão
                  excluídos!
                </p>
              )}
              {eventCount > 0 && (
                <p className="mt-1 font-medium text-red-600">
                  Além disso, {eventCount === 1 ? "1 evento" : `${eventCount} eventos`} associados serão removidos.
                </p>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
              <p className="text-sm">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. A ONG e todos os seus dados serão removidos
                permanentemente do sistema.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleDelete} variant="destructive" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
                </>
              ) : (
                "Confirmar Exclusão"
              )}
            </Button>
            <Button variant="outline" className="w-full" asChild disabled={isPending}>
              <Link href={`/admin/ongs/${ong.id}`}>Cancelar</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
