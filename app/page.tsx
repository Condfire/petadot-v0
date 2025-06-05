export const dynamic = "force-dynamic"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import SectionHeader from "@/components/section-header"
import AnimateOnScroll from "@/components/animate-on-scroll"
import { PawPrint, Heart } from "lucide-react"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
import StatsSection from "@/components/stats-section"
import PetCard from "@/components/PetCard"
import { OptimizedImage } from "@/components/optimized-image"
import { createClient } from "@/lib/supabase/server"

// Desativar completamente o cache para a página inicial
export const revalidate = 0

// Função para buscar pets para adoção aprovados
async function getPetsForAdoption(limit = 4) {
  try {
    const supabase = createClient()

    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "adoption")
      .in("status", ["approved", "aprovado"])
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar pets para adoção:", error)
      return []
    }

    return pets || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets para adoção:", error)
    return []
  }
}

// Função para buscar pets perdidos aprovados
async function getLostPets(limit = 4) {
  try {
    const supabase = createClient()

    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("category", "lost")
      .in("status", ["approved", "aprovado"])
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar pets perdidos:", error)
      return []
    }

    return pets || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets perdidos:", error)
    return []
  }
}

// Função para buscar eventos
async function getEvents(limit = 3) {
  try {
    const supabase = createClient()

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar eventos:", error)
      return []
    }

    return events || []
  } catch (error) {
    console.error("Erro inesperado ao buscar eventos:", error)
    return []
  }
}

export default async function Home() {
  // Adicionar no início da função:
  console.log("Renderizando página inicial...")

  try {
    // Substituir o bloco Promise.allSettled por:
    let adoptionPetsData: any[] = []
    let lostPetsData: any[] = []
    let eventsData: any[] = []

    try {
      adoptionPetsData = await getPetsForAdoption(4)
    } catch (error) {
      console.error("Erro ao buscar pets para adoção:", error)
    }

    try {
      lostPetsData = await getLostPets(4)
    } catch (error) {
      console.error("Erro ao buscar pets perdidos:", error)
    }

    try {
      eventsData = await getEvents(3)
    } catch (error) {
      console.error("Erro ao buscar eventos:", error)
    }

    console.log("Página inicial - Pets para adoção aprovados:", adoptionPetsData.length)
    console.log("Página inicial - Pets perdidos aprovados:", lostPetsData.length)
    console.log("Página inicial - Eventos:", eventsData.length)

    return (
      <div className="flex flex-col min-h-screen">
        <HeroSection />

        <section className="container py-12 md:py-16">
          <AnimateOnScroll>
            <SectionHeader
              title="Pets para Adoção"
              description="Encontre seu novo melhor amigo"
              viewAllLink="/adocao"
            />
          </AnimateOnScroll>

          {Array.isArray(adoptionPetsData) && adoptionPetsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {adoptionPetsData.map((pet, index) => {
                if (!pet || !pet.id) return null

                return (
                  <AnimateOnScroll key={pet.id} delay={index * 100}>
                    <PetCard pet={pet} />
                  </AnimateOnScroll>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
              <p className="text-muted-foreground">
                Ainda não há pets para adoção aprovados. Seja o primeiro a cadastrar um pet!
              </p>
              <Button className="mt-4" asChild>
                <Link href="/adocao/cadastrar">Cadastrar Pet para Adoção</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="container py-12 md:py-16 border-t border-border/40">
          <AnimateOnScroll>
            <SectionHeader
              title="Pets Perdidos"
              description="Ajude estes pets a voltarem para casa"
              viewAllLink="/perdidos"
            />
          </AnimateOnScroll>

          {Array.isArray(lostPetsData) && lostPetsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {lostPetsData.map((pet, index) => {
                if (!pet || !pet.id) return null

                return (
                  <AnimateOnScroll key={pet.id} delay={index * 100}>
                    <PetCard pet={pet} />
                  </AnimateOnScroll>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
              <p className="text-muted-foreground">
                Não há pets perdidos aprovados registrados no momento. Isso é uma boa notícia!
              </p>
            </div>
          )}
        </section>

        <StatsSection />

        <section className="container py-12 md:py-16 border-t border-border/40">
          <AnimateOnScroll>
            <SectionHeader
              title="Próximos Eventos"
              description="Participe e ajude a causa animal"
              viewAllLink="/eventos"
            />
          </AnimateOnScroll>

          {Array.isArray(eventsData) && eventsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {eventsData.map((event, index) => {
                if (!event || !event.id) return null

                return (
                  <AnimateOnScroll key={event.id} delay={index * 100}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 relative">
                        <OptimizedImage
                          src={event.image_url || "/placeholder.svg?height=192&width=384&query=pet+event"}
                          alt={event.title || "Evento"}
                          width={384}
                          height={192}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg">{event.title || "Evento sem título"}</h3>
                        <p className="text-sm text-gray-600">
                          Data: {new Date(event.start_date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">Local: {event.location || "Local não informado"}</p>
                        <p className="mt-2 text-sm line-clamp-2">{event.description || "Sem descrição"}</p>
                        <Button className="mt-3 w-full" asChild>
                          <Link href={`/eventos/${event.slug || event.id}`}>Ver detalhes</Link>
                        </Button>
                      </div>
                    </div>
                  </AnimateOnScroll>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
              <p className="text-muted-foreground">
                Não há eventos programados para os próximos dias. Fique de olho para novidades!
              </p>
            </div>
          )}
        </section>

        <TestimonialsSection />

        <section className="bg-muted/50 py-12 md:py-16 border-t border-border/40">
          <div className="container">
            <AnimateOnScroll>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                    <PawPrint className="text-primary" size={24} />
                    Conheça as ONGs Parceiras
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Diversas organizações trabalham incansavelmente pelo bem-estar animal. Conheça, apoie e colabore com
                    essas instituições.
                  </p>
                  <Button asChild className="group">
                    <Link href="/ongs">
                      <Heart className="mr-2 h-4 w-4 group-hover:text-red-200 transition-colors" />
                      Ver Todas as ONGs
                    </Link>
                  </Button>
                </div>
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-lg">
                  <OptimizedImage
                    src="/ongs-collage.jpg"
                    alt="Colagem de ONGs parceiras"
                    width={640}
                    height={360}
                    className="w-full h-full transition-transform duration-700 hover:scale-105"
                    objectFit="cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        <CTASection />
      </div>
    )
  } catch (error) {
    console.error("Erro crítico ao renderizar a página inicial:", error)
    // Fallback em caso de erro crítico
    return (
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        <div className="container py-12">
          <p className="text-center text-muted-foreground">
            Estamos com dificuldades para carregar os dados mais recentes. Por favor, tente novamente mais tarde.
          </p>
        </div>
        <CTASection />
      </div>
    )
  }
}
