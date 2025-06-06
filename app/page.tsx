import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import SectionHeader from "@/components/section-header"
import AnimateOnScroll from "@/components/animate-on-scroll"
import { PawPrint, Heart } from "lucide-react"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
import StatsSection from "@/components/stats-section"
import { OptimizedImage } from "@/components/optimized-image"

// Forçar renderização dinâmica
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <section className="container py-12 md:py-16">
        <AnimateOnScroll>
          <SectionHeader title="Pets para Adoção" description="Encontre seu novo melhor amigo" viewAllLink="/adocao" />
        </AnimateOnScroll>

        <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
          <p className="text-muted-foreground mb-4">
            Explore nossa seção de adoção para encontrar pets esperando por um lar.
          </p>
          <Button asChild>
            <Link href="/adocao">Ver Pets para Adoção</Link>
          </Button>
        </div>
      </section>

      <section className="container py-12 md:py-16 border-t border-border/40">
        <AnimateOnScroll>
          <SectionHeader
            title="Pets Perdidos"
            description="Ajude estes pets a voltarem para casa"
            viewAllLink="/perdidos"
          />
        </AnimateOnScroll>

        <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
          <p className="text-muted-foreground mb-4">Veja nossa seção de pets perdidos e ajude a reunir famílias.</p>
          <Button asChild>
            <Link href="/perdidos">Ver Pets Perdidos</Link>
          </Button>
        </div>
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
