"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { Calendar, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/like-button"
import { ShareButtons } from "@/components/share-buttons"

interface StoryDetailClientWrapperProps {
  story: any
  isAuthenticated: boolean
  isAuthor: boolean
  isAdmin: boolean
  formattedDate: string
  createdAt: Date
}

export function StoryDetailClientWrapper({
  story,
  isAuthenticated,
  isAuthor,
  isAdmin,
  formattedDate,
  createdAt,
}: StoryDetailClientWrapperProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">{story.title}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
                {story.user?.avatar_url ? (
                  <Image
                    src={story.user.avatar_url || "/placeholder.svg"}
                    alt={story.user?.name || "Usuário"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                    {story.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{story.user?.name || "Usuário"}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <time dateTime={story.created_at}>{formattedDate}</time>
                </div>
              </div>
            </div>
          </div>

          {(isAuthor || isAdmin) && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/historias/${story.id}/editar`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-destructive">
                <Link href={`/historias/${story.id}/excluir`}>
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Link>
              </Button>
            </div>
          )}
        </div>

        {story.image_url && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden">
            <Image
              src={story.image_url || "/placeholder.svg"}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-line">{story.content}</p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <LikeButton storyId={story.id} initialLikes={story.likes || 0} isAuthenticated={isAuthenticated} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Sobre o Autor</h2>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
              {story.user?.avatar_url ? (
                <Image
                  src={story.user.avatar_url || "/placeholder.svg"}
                  alt={story.user?.name || "Usuário"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                  {story.user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{story.user?.name || "Usuário"}</p>
              <p className="text-sm text-muted-foreground">
                Membro desde {format(createdAt, "MMM yyyy", { locale: pt })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Compartilhe</h2>
          <p className="text-sm text-muted-foreground mb-4">Gostou desta história? Compartilhe com seus amigos!</p>
          <ShareButtons title={story.title} />
        </div>
      </div>
    </div>
  )
}
