"use client"

import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPetStory, updatePetStory } from "@/app/actions/pet-stories-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface StoryFormProps {
  story?: any
  isEdit?: boolean
}

type Pet = {
  id: string
  name: string
  type: string
}

export function StoryForm({ story, isEdit = false }: StoryFormProps) {
  const [title, setTitle] = useState(story?.title || "")
  const [content, setContent] = useState(story?.content || "")
  const [imageUrl, setImageUrl] = useState(story?.image_url || "")
  const [petId, setPetId] = useState(story?.pet_id || "")
  const [isPending, startTransition] = useTransition()
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserPets = async () => {
      try {
        setIsLoadingPets(true)
        const { data: session } = await supabase.auth.getSession()

        if (!session?.session?.user) {
          setIsLoadingPets(false)
          return
        }

        const userId = session.session.user.id

        // Buscar pets de adoção
        const { data: adoptionPets, error: adoptionError } = await supabase
          .from("pets_adoption")
          .select("id, name")
          .eq("user_id", userId)

        // Buscar pets perdidos
        const { data: lostPets, error: lostError } = await supabase
          .from("pets_lost")
          .select("id, name")
          .eq("user_id", userId)

        // Buscar pets encontrados
        const { data: foundPets, error: foundError } = await supabase
          .from("pets_found")
          .select("id, name")
          .eq("user_id", userId)

        const allPets = [
          ...(adoptionPets || []).map((pet) => ({ ...pet, type: "adoption" })),
          ...(lostPets || []).map((pet) => ({ ...pet, type: "lost" })),
          ...(foundPets || []).map((pet) => ({ ...pet, type: "found" })),
        ]

        setUserPets(allPets)
      } catch (error) {
        console.error("Erro ao buscar pets do usuário:", error)
      } finally {
        setIsLoadingPets(false)
      }
    }

    fetchUserPets()
  }, [supabase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo da história",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    if (imageUrl) {
      formData.append("imageUrl", imageUrl)
    }
    if (petId) {
      formData.append("petId", petId)
    }

    startTransition(async () => {
      try {
        let result

        if (isEdit && story) {
          result = await updatePetStory(story.id, formData)
        } else {
          result = await createPetStory(formData)
        }

        if (result.success) {
          toast({
            title: isEdit ? "História atualizada" : "História criada",
            description: isEdit
              ? "Sua história foi atualizada com sucesso"
              : "Sua história foi criada com sucesso e está aguardando aprovação",
          })

          if (isEdit) {
            router.push(`/historias/${story.id}`)
          } else {
            router.push("/dashboard/historias")
          }
          router.refresh()
        } else {
          toast({
            title: "Erro",
            description: result.error || "Ocorreu um erro ao processar sua solicitação",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao processar formulário:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar sua solicitação",
          variant: "destructive",
        })
      }
    })
  }

  // Função para obter o texto do tipo de pet
  const getPetTypeText = (type: string) => {
    switch (type) {
      case "adoption":
        return "Adoção"
      case "lost":
        return "Perdido"
      case "found":
        return "Encontrado"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sua história"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet">Pet Relacionado (opcional)</Label>
            <Select value={petId} onValueChange={setPetId}>
              <SelectTrigger id="pet" className="w-full">
                <SelectValue placeholder="Selecione um pet (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none-selected">Nenhum pet selecionado</SelectItem>
                {isLoadingPets ? (
                  <SelectItem value="loading" disabled>
                    Carregando pets...
                  </SelectItem>
                ) : userPets.length > 0 ? (
                  userPets.map((pet) => (
                    <SelectItem key={`${pet.type}-${pet.id}`} value={`${pet.type}:${pet.id}`}>
                      {pet.name} ({getPetTypeText(pet.type)})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Você não tem pets cadastrados
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">Selecione um pet para relacionar à sua história</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe sua história..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url)} onRemove={() => setImageUrl("")} />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Atualizando..." : "Enviando..."}
                </>
              ) : isEdit ? (
                "Atualizar História"
              ) : (
                "Compartilhar História"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
