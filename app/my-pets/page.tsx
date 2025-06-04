import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserPets } from "@/lib/supabase"
import PetCard from "@/components/PetCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function MyPetsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/my-pets")
  }

  // Buscar os pets do usuário
  const { adoptionPets, lostPets, foundPets, resolvedPets } = await getUserPets(session.user.id)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meus Pets</h1>
          <p className="text-muted-foreground">Gerencie seus pets cadastrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/adocao/cadastrar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Cadastrar para Adoção
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/perdidos/cadastrar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Reportar Perdido
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/encontrados/cadastrar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Reportar Encontrado
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="adoption">
        <TabsList className="mb-6">
          <TabsTrigger value="adoption">Para Adoção ({adoptionPets.length})</TabsTrigger>
          <TabsTrigger value="lost">Perdidos ({lostPets.length})</TabsTrigger>
          <TabsTrigger value="found">Encontrados ({foundPets.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos ({resolvedPets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="adoption">
          {adoptionPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {adoptionPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  image={pet.image_url}
                  species={pet.species}
                  age={pet.age}
                  size={pet.size}
                  gender={pet.gender}
                  status={pet.status}
                  type="adoption"
                  isOwner={true}
                  isSpecialNeeds={pet.is_special_needs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum pet para adoção.</p>
              <Button asChild>
                <Link href="/adocao/cadastrar">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Pet para Adoção
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lost">
          {lostPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {lostPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name || "Pet sem nome"}
                  image={pet.image_url}
                  species={pet.species}
                  size={pet.size}
                  gender={pet.gender}
                  status={pet.status}
                  type="lost"
                  isOwner={true}
                  isSpecialNeeds={pet.is_special_needs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não reportou nenhum pet perdido.</p>
              <Button asChild variant="outline">
                <Link href="/perdidos/cadastrar">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Reportar Pet Perdido
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="found">
          {foundPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foundPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name || "Pet sem nome"}
                  image={pet.image_url}
                  species={pet.species}
                  size={pet.size}
                  gender={pet.gender}
                  status={pet.status}
                  type="found"
                  isOwner={true}
                  isSpecialNeeds={pet.is_special_needs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não reportou nenhum pet encontrado.</p>
              <Button asChild variant="outline">
                <Link href="/encontrados/cadastrar">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Reportar Pet Encontrado
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          {resolvedPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {resolvedPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name || "Pet sem nome"}
                  image={pet.image_url}
                  species={pet.species}
                  size={pet.size}
                  gender={pet.gender}
                  status={pet.status}
                  type={pet.type}
                  isOwner={false}
                  isSpecialNeeds={pet.is_special_needs}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Você ainda não tem pets resolvidos.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
