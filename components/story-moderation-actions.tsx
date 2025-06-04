"use client"

import { ModerationActions } from "@/components/moderation-actions"

interface StoryModerationActionsProps {
  id: string
}

export function StoryModerationActions({ id }: StoryModerationActionsProps) {
  return (
    <ModerationActions
      id={id}
      type="pet_story"
      onSuccess={() => {
        // Recarregar a página para atualizar a lista
        window.location.reload()
      }}
    />
  )
}
