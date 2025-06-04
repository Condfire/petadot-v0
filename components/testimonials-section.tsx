"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar histórias do banco de dados
  useEffect(() => {
    async function loadStories() {
      try {
        setIsLoading(true)

        // Usar o cliente do Supabase para buscar histórias aprovadas
        const supabase = createClientComponentClient()

        // Buscar histórias aprovadas
        const { data, error } = await supabase
          .from("pet_stories")
          .select(`
    id,
    title,
    content,
    status,
    user_id,
    created_at,
    likes_count
  `)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) {
          console.error("Erro ao buscar histórias:", error)
          setIsLoading(false)
          return
        }

        // Se não houver histórias, definir como array vazio
        if (!data || data.length === 0) {
          setTestimonials([])
          setIsLoading(false)
          return
        }

        // Para cada história, buscar informações do usuário
        const storiesWithUsers = await Promise.all(
          data.map(async (story) => {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name, avatar_url")
              .eq("id", story.user_id)
              .single()

            return {
              ...story,
              user: userError ? { name: "Usuário", avatar_url: null } : userData,
            }
          }),
        )

        // Atualizar o estado com as histórias carregadas
        setTestimonials(storiesWithUsers)
      } catch (error) {
        console.error("Erro ao carregar histórias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStories()

    // Configurar um listener para recarregar quando a página ficar visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadStories()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Funções para navegar entre os cards
  const nextPage = () => {
    if (testimonials.length <= 2) return
    setCurrentPage((prev) => (prev + 1) % Math.ceil(testimonials.length / 2))
  }

  const prevPage = () => {
    if (testimonials.length <= 2) return
    setCurrentPage((prev) => (prev - 1 + Math.ceil(testimonials.length / 2)) % Math.ceil(testimonials.length / 2))
  }

  // Formatar data
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (e) {
      return "Data não disponível"
    }
  }

  // Calcular quais cards mostrar na página atual
  const startIndex = currentPage * 2
  const visibleTestimonials = testimonials.slice(startIndex, startIndex + 2)

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">O que dizem sobre nós</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja o que nossos usuários e parceiros estão falando sobre a experiência com a nossa plataforma.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-center">
              <p>Carregando histórias...</p>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg">Ainda não há histórias disponíveis. Seja o primeiro a compartilhar sua história!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {visibleTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        {testimonial.user?.avatar_url ? (
                          <AvatarImage
                            src={testimonial.user.avatar_url || "/placeholder.svg"}
                            alt={testimonial.user.name || "Usuário"}
                          />
                        ) : (
                          <AvatarFallback>{(testimonial.user?.name || "U").charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle>{testimonial.user?.name || "Usuário"}</CardTitle>
                        <CardDescription>{formatDate(testimonial.created_at)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <h3 className="font-semibold mb-2">{testimonial.title}</h3>
                    <p className="text-muted-foreground italic flex-1">
                      "{testimonial.content?.substring(0, 150)}
                      {testimonial.content?.length > 150 ? "..." : ""}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {testimonials.length > 2 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button variant="outline" size="icon" onClick={prevPage} aria-label="Página anterior">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextPage} aria-label="Próxima página">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
