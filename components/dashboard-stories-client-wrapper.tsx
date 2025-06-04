"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/story-card"

interface DashboardStoriesClientWrapperProps {
  stories: any[] | null
  error: string | null
}

export function DashboardStoriesClientWrapper({ stories, error }: DashboardStoriesClientWrapperProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">
          Ocorreu um erro ao carregar suas histórias. Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  if (stories && stories.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} showStatus showActions />
        ))}
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <p className="text-lg text-muted-foreground mb-4">Você ainda não compartilhou nenhuma história.</p>
      <Button asChild>
        <Link href="/historias/nova">Compartilhar História</Link>
      </Button>
    </div>
  )
}
