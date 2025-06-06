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

// Forçar renderização dinâmica
export const dynamic = "force-dynamic"
export const revalidate = 0

// Função para buscar pets para adoção aprovados com tratamento de erros robusto
async function getPetsForAdoption(limit = 4) {
  try {
    const supabase = createClient()

    // Consulta com tratamento de erro
    const { data, error } = await supabase
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

    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets para adoção:", error)
    return []
  }
}

// Função para buscar pets perdidos aprovados com tratamento de erros robusto
async function getLostPets(limit = 4) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
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

    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar pets perdidos:", error)
    return []
  }
}

export default async function Home() {
  // Buscar pets com tratamento de erros
  let adoptionPets = []
  let lostPets = []

  try {
    // Buscar pets para adoção
    adoptionPets = await getPetsForAdoption(4)
    console.log(`Encontrados ${adoptionPets.length} pets para adoção`)
  } catch (error) {
    console.error("Falha ao buscar pets para adoção:", error)
    adoptionPets = []
  }

  try {
    // Buscar pets perdidos
    lostPets = await getLostPets(4)
    console.log(`Encontrados ${lostPets.length} pets perdidos`)
  } catch (error) {
    console.error("Falha ao buscar pets perdidos:", error)
    lostPets = []
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <section className="container py-12 md:py-16">
        <AnimateOnScroll>
          <SectionHeader title="Pets para Adoção" description="Encontre seu novo melhor amigo" viewAllLink="/adocao" />
        </AnimateOnScroll>

        {Array.isArray(adoptionPets) && adoptionPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {adoptionPets.map((pet, index) => {
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
            <p className="text-muted-foreground mb-4">
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

        {Array.isArray(lostPets) && lostPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {lostPets.map((pet, index) => {
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
            <p className="text-muted-foreground mb-4">
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

        <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
          <p className="text-muted-foreground mb-4">Confira os eventos relacionados à proteção animal.</p>
          <Button asChild>
            <Link href="/eventos">Ver Eventos</Link>
          </Button>
        </div>
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
}
