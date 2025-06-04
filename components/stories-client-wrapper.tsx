"use client"

import { useEffect, useState } from "react"
import { StoryCard } from "@/components/story-card"
import { Pagination } from "@/components/ui/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface StoriesClientWrapperProps {
  stories: any[]
  error?: string
  message?: string
  totalPages: number
  currentPage: number
  isAuthenticated: boolean
}

export function StoriesClientWrapper({
  stories,
  error,
  message,
  totalPages,
  currentPage,
  isAuthenticated,
}: StoriesClientWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground mb-4">
          {message || "Ainda não há histórias disponíveis. Seja o primeiro a compartilhar sua história!"}
        </p>
        {isAuthenticated && (
          <Button asChild>
            <Link href="/historias/nova">Compartilhar História</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
