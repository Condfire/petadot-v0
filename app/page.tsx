import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import SectionHeader from "@/components/section-header"
import AnimateOnScroll from "@/components/animate-on-scroll"
import { PawPrint, Heart } from "lucide-react"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
import { getPetsForAdoption, getLostPets, getEvents } from "@/lib/supabase"
import StatsSection from "@/components/stats-section"
import PetCard from "@/components/PetCard"
import { OptimizedImage } from "@/components/optimized-image"
import { EventCard } from "@/components/event-card"

// Desativar completamente o cache para a página inicial durante o desenvolvimento
export const revalidate = 0 // Revalidate on every request

export default async function Home() {
  // Buscar dados reais do Supabase
  const timestamp = Date.now()
  console.log(`Renderizando página inicial: ${timestamp}`)

  try {
    // Buscar apenas os primeiros 4 pets para cada categoria (sem paginação completa)
    const adoptionPetsResult = await getPetsForAdoption(1, 4)
    const lostPetsResult = await getLostPets(1, 4)
    const eventsResult = await getEvents(1, 4, {
      start_date: new Date().toISOString(),
    })

    // Extrair os arrays de dados dos resultados paginados
    const adoptionPets = adoptionPetsResult.data || []
    const lostPets = lostPetsResult.data || []
    const events = eventsResult.data || []

    console.log("Página inicial - Pets para adoção:", adoptionPets.length)
    console.log("Página inicial - Pets perdidos:", lostPets.length)
    console.log("Página inicial - Eventos:", events.length)

    // Não precisamos mais fazer slice, pois já limitamos a 4 na consulta
    const recentAdoptionPets = adoptionPets
    const recentLostPets = lostPets
    // Filtramos apenas eventos futuros
    const upcomingEvents = events
      .filter((event) => new Date(event.start_date) >= new Date())
      .slice(0, 3)

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

          {recentAdoptionPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {recentAdoptionPets.map((pet, index) => (
                <AnimateOnScroll key={pet.id} delay={index * 100}>
                  <PetCard
                    id={pet.id}
                    name={pet.name}
                    main_image_url={pet.main_image_url || pet.image_url || "/a-cute-pet.png"}
                    species={pet.species}
                    species_other={pet.species_other}
                    age={pet.age}
                    size={pet.size}
                    size_other={pet.size_other}
                    gender={pet.gender}
                    gender_other={pet.gender_other}
                    status={pet.status}
                    type="adoption"
                    isSpecialNeeds={pet.is_special_needs}
                    slug={pet.slug}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
              <p className="text-muted-foreground">
                Ainda não há pets para adoção. Seja o primeiro a cadastrar um pet!
              </p>
              <Button className="mt-4" asChild>
                <Link href="/cadastrar-pet-adocao">Cadastrar Pet para Adoção</Link>
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

          {recentLostPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {recentLostPets.map((pet, index) => (
                <AnimateOnScroll key={pet.id} delay={index * 100}>
                  <PetCard
                    id={pet.id}
                    name={pet.name}
                    main_image_url={pet.main_image_url || pet.image_url || "/a-cute-pet.png"}
                    species={pet.species}
                    species_other={pet.species_other}
                    age={pet.age}
                    size={pet.size}
                    size_other={pet.size_other}
                    gender={pet.gender}
                    gender_other={pet.gender_other}
                    status={pet.status}
                    type="lost"
                    isSpecialNeeds={pet.is_special_needs}
                    slug={pet.slug}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
              <p className="text-muted-foreground">
                Não há pets perdidos registrados no momento. Isso é uma boa notícia!
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

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <AnimateOnScroll key={event.id} delay={index * 100}>
                  <EventCard
                    id={event.id}
                    name={event.name}
                    description={event.description}
                    image_url={event.image_url}
                    location={event.location}
                    city={event.city}
                    state={event.state}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    event_type={event.event_type}
                    slug={event.slug}
                  />
                </AnimateOnScroll>
              ))}
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
    console.error("Erro ao renderizar a página inicial:", error)
    // Fallback em caso de erro
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
