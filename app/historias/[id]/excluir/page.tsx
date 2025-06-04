"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deletePetStory, getPetStoryById } from "@/app/actions/pet-stories-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ExcluirHistoriaPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Buscar história
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setIsLoading(true)
        console.log("Buscando história com ID:", params.id)

        // Verificar se o usuário está autenticado
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("Usuário não autenticado, redirecionando para login")
          router.push(`/login?redirectTo=/historias/${params.id}/excluir`)
          return
        }

        console.log("Usuário autenticado:", session.user.id)

        // Buscar história
        const result = await getPetStoryById(params.id)
        console.log("Resultado da busca:", result)

        if (!result.success || !result.data) {
          console.error("História não encontrada:", result.error)
          setError(result.error || "História não encontrada")
          return
        }

        console.log("História encontrada:", result.data)

        // Verificar se o usuário é o autor da história ou admin
        if (result.data.user_id !== session.user.id) {
          console.log("Usuário não é o autor, verificando se é admin")

          // Verificar se o usuário é admin
          const { data: userData } = await supabase.from("users").select("is_admin").eq("id", session.user.id).single()

          if (!userData?.is_admin) {
            console.log("Usuário não é admin, redirecionando")
            // Redirecionar para a página da história se não for o autor nem admin
            router.push(`/historias/${params.id}`)
            return
          }

          console.log("Usuário é admin, permitindo acesso")
        } else {
          console.log("Usuário é o autor da história")
        }

        setStory(result.data)
      } catch (error) {
        console.error("Erro ao buscar história:", error)
        setError("Ocorreu um erro ao buscar a história")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStory()
  }, [params.id, router, supabase])

  // Função para excluir história
  const handleDelete = () => {
    startTransition(async () => {
      try {
        console.log("Excluindo história com ID:", params.id)
        const result = await deletePetStory(params.id)
        console.log("Resultado da exclusão:", result)

        if (result.success) {
          toast({
            title: "História excluída",
            description: "Sua história foi excluída com sucesso",
          })

          router.push("/dashboard/historias")
          router.refresh()
        } else {
          toast({
            title: "Erro",
            description: result.error || "Ocorreu um erro ao excluir a história",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao excluir história:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar sua solicitação",
          variant: "destructive",
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="container py-8 md:py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="container py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{error || "Ocorreu um erro ao buscar a história"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/historias">Voltar para minhas histórias</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Excluir História</CardTitle>
          <CardDescription>
            Tem certeza que deseja excluir a história "{story.title}"? Esta ação não pode ser desfeita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ao excluir esta história, todos os dados associados a ela serão removidos permanentemente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir História"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
