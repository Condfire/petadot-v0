import Link from "next/link"
import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/section-header"
import AnimateOnScroll from "@/components/animate-on-scroll"

export default function PetsSectionFallback() {
  return (
    <>
      {/* Seção de Pets para Adoção */}
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

      {/* Seção de Pets Perdidos */}
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
    </>
  )
}
