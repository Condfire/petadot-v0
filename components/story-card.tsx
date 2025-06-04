"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { User, Edit, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LikeButton } from "@/components/like-button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StoryCardProps {
  story: any
  showStatus?: boolean
  showActions?: boolean
}

export function StoryCard({ story, showStatus = false, showActions = false }: StoryCardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthor, setIsAuthor] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Verificar se o usuário está autenticado
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClientComponentClient()
        const { data } = await supabase.auth.getSession()
        const session = data.session

        setIsAuthenticated(!!session)

        if (session) {
          setUserId(session.user.id)
          setIsAuthor(session.user.id === story.user_id)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsAuthenticated(false)
        setIsAuthor(false)
      }
    }

    checkAuth()
  }, [story.user_id])

  // Determinar se é uma história de pet_stories ou success_stories
  const isPetStory = story.hasOwnProperty("content")

  // Extrair dados comuns
  const id = story.id
  const title = story.title
  const content = isPetStory ? story.content : story.story
  const imageUrl = story.image_url
  const createdAt = new Date(story.created_at)
  const likes = story.likes || 0
  const status = story.status || "aprovado"

  // Extrair dados do usuário
  const userName = story.user?.name || "Usuário"
  const userAvatar = story.user?.avatar_url

  // Formatar data relativa
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="p-0">
        {imageUrl ? (
          <div className="relative h-48 w-full">
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="bg-muted h-48 flex items-center justify-center">
            <span className="text-muted-foreground">Sem imagem</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold line-clamp-2">{title}</h3>
          {(showStatus || status !== "aprovado") && (
            <Badge variant={status === "pendente" ? "outline" : status === "aprovado" ? "default" : "destructive"}>
              {status === "pendente" ? "Pendente" : status === "aprovado" ? "Aprovado" : "Rejeitado"}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{content}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={userAvatar || ""} alt={userName} />
            <AvatarFallback className="bg-primary/10">
              <User className="h-3 w-3 text-primary" />
            </AvatarFallback>
          </Avatar>
          <span>{userName}</span>
          <span className="mx-2">•</span>
          <span>{timeAgo}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <LikeButton storyId={id} initialLikes={likes} isAuthenticated={isAuthenticated} />

        {showActions && isAuthor && isPetStory && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/historias/${id}/editar`}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-destructive hover:text-destructive">
              <Link href={`/historias/${id}/excluir`}>
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
