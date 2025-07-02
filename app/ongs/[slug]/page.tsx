import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PetCard from "@/components/pet-card"
import { EventCard } from "@/components/event-card"
import { MapPin, Mail, Phone, Globe, Calendar, PawPrint, Clock } from "lucide-react"
import { isUuid } from "uuidv4"

export const dynamic = "force-dynamic"

// Atualizar os parâmetros para usar slug em vez de id
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const slugOrId = params.slug
  const isUuidValue = isUuid(slugOrId)

  // Query based on whether it's a UUID or slug
  const { data: ong } = await supabase
    .from("ongs")
    .select("name")
    .eq(isUuidValue ? "id" : "slug", slugOrId)
    .single()

  if (!ong) {
    return {
      title: "ONG não encontrada | PetAdot",
    }
  }

  return {
    title: `${ong.name} | PetAdot`,
    description: `Conheça a ONG ${ong.name} e seus pets disponíveis para adoção`,
  }
}

// Atualizar a função principal para usar slug
export default async function OngPage({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const slugOrId = params.slug
  const isUuidValue = isUuid(slugOrId)

  // Buscar detalhes da ONG
  const { data: ong, error: ongError } = await supabase
    .from("ongs")
    .select("*")
    .eq(isUuidValue ? "id" : "slug", slugOrId)
    .single()

  if (ongError || !ong) {
    console.error("Erro ao buscar ONG:", ongError)
    notFound()
  }

  console.log("ONG encontrada:", ong.name, "ID:", ong.id)

  // Buscar pets da ONG
  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("*")
    .eq("ong_id", ong.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (petsError) {
    console.error("Erro ao buscar pets da ONG:", petsError)
  }

  console.log("Pets encontrados para a ONG:", pets?.length || 0)

  // Buscar eventos da ONG
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("ong_id", ong.id)
    .eq("status", "approved")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })

  if (eventsError) {
    console.error("Erro ao buscar eventos da ONG:", eventsError)
  }

  console.log("Eventos encontrados para a ONG:", events?.length || 0)

  return (
    <main className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            {ong.logo_url && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border">
                <Image src={ong.logo_url || "/placeholder.svg"} alt={ong.name} fill className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{ong.name}</h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {ong.city}, {ong.state}
                </span>
              </div>
              {ong.contact_email && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <a href={`mailto:${ong.contact_email}`} className="hover:underline">
                    {ong.contact_email}
                  </a>
                </div>
              )}
              {ong.contact_phone && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  <a href={`tel:${ong.contact_phone}`} className="hover:underline">
                    {ong.contact_phone}
                  </a>
                </div>
              )}
              {ong.website && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <Globe className="h-4 w-4 mr-1" />
                  <a href={ong.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {ong.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {ong.description && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-2">Sobre a ONG</h2>
                <p className="text-muted-foreground whitespace-pre-line">{ong.description}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="pets" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="pets" className="flex items-center">
                <PawPrint className="h-4 w-4 mr-1" /> Pets para Adoção
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Eventos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pets">
              {pets && pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      id={pet.id}
                      name={pet.name}
                      image={pet.main_image_url || pet.image_url}
                      location={`${ong.city}, ${ong.state}`}
                      species={pet.species}
                      age={pet.age}
                      gender={pet.gender}
                      size={pet.size}
                      type="adoption"
                      ongId={ong.id}
                      ongName={ong.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Nenhum pet disponível para adoção no momento</h3>
                  <p className="text-muted-foreground mt-1">Volte mais tarde para verificar novos pets.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              {events && events.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      name={event.name}
                      image={event.image_url}
                      start_date={event.start_date}
                      location={event.location}
                      description={event.description}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Nenhum evento programado no momento</h3>
                  <p className="text-muted-foreground mt-1">Volte mais tarde para verificar novos eventos.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Informações</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <PawPrint className="h-5 w-5 mr-2 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Pets para Adoção</h3>
                    <p className="text-sm text-muted-foreground">{pets?.length || 0} pets disponíveis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Próximos Eventos</h3>
                    <p className="text-sm text-muted-foreground">{events?.length || 0} eventos programados</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Na plataforma desde</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ong.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={`/contato?ong=${ong.id}`}>Entrar em Contato</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
