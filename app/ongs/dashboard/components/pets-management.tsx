"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Eye, MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  status: string
  main_image_url: string
  created_at: string
  category: string
}

interface PetsManagementProps {
  pets: Pet[]
}

export default function PetsManagement({ pets }: PetsManagementProps) {
  const router = useRouter()

  const pendingPets = pets.filter((pet) => pet.status === "pending")
  const approvedPets = pets.filter((pet) => pet.status === "approved")
  const adoptedPets = pets.filter((pet) => pet.status === "adopted")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "approved":
        return <Badge variant="default">Aprovado</Badge>
      case "adopted":
        return <Badge variant="secondary">Adotado</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const PetCard = ({ pet }: { pet: Pet }) => (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="relative h-16 w-16 rounded-lg overflow-hidden">
        <Image
          src={pet.main_image_url || "/placeholder.svg?height=64&width=64&query=pet"}
          alt={pet.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{pet.name}</h3>
        <p className="text-sm text-muted-foreground">
          {pet.breed} • {pet.age} {pet.age === 1 ? "ano" : "anos"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {getStatusBadge(pet.status)}
          <Badge variant="outline" className="text-xs">
            {pet.category === "adoption" ? "Adoção" : pet.category}
          </Badge>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/adocao/${pet.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/ongs/dashboard/pets/${pet.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gerenciar Pets</CardTitle>
            <CardDescription>Gerencie todos os pets da sua ONG</CardDescription>
          </div>
          <Button onClick={() => router.push("/ongs/dashboard/pets/cadastrar")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendentes ({pendingPets.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados ({approvedPets.length})</TabsTrigger>
            <TabsTrigger value="adopted">Adotados ({adoptedPets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPets.length > 0 ? (
              pendingPets.map((pet) => <PetCard key={pet.id} pet={pet} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum pet pendente de aprovação</p>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedPets.length > 0 ? (
              approvedPets.map((pet) => <PetCard key={pet.id} pet={pet} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum pet aprovado</p>
            )}
          </TabsContent>

          <TabsContent value="adopted" className="space-y-4">
            {adoptedPets.length > 0 ? (
              adoptedPets.map((pet) => <PetCard key={pet.id} pet={pet} />)
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum pet adotado ainda</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
