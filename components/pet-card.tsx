"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertTriangle, Clock } from "lucide-react"
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { mapPetSpecies, mapPetSize, mapPetGender } from "@/lib/mappers"

interface PetCardProps {
  id: string
  name: string
  image: string
  species: string
  species_other?: string
  age?: string | number
  size?: string
  size_other?: string
  gender?: string
  gender_other?: string
  status?: string
  type: "adoption" | "lost" | "found"
  isOwner?: boolean
  isSpecialNeeds?: boolean
  onDelete?: () => void
  slug?: string
}

const statusMap: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  available: { label: "Disponível", color: "bg-green-500" },
  pending: {
    label: "Pendente",
    color: "bg-yellow-500",
    icon: <Clock className="h-3 w-3 mr-1" />,
  },
  adopted: { label: "Adotado", color: "bg-blue-500" },
  approved: { label: "Aprovado", color: "bg-green-500" },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-500",
  },
  resolved: { label: "Encontrado", color: "bg-blue-500" },
  reunited: { label: "Reunido", color: "bg-blue-500" },
}

export default function PetCard({
  id,
  name,
  image,
  species,
  species_other,
  age,
  size,
  size_other,
  gender,
  gender_other,
  status,
  type,
  isOwner = false,
  isSpecialNeeds = false,
  onDelete,
  slug,
}: PetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para excluir um pet.",
          variant: "destructive",
        })
        return
      }

      let tableName = ""
      switch (type) {
        case "adoption":
          tableName = "pets"
          break
        case "lost":
          tableName = "pets_lost"
          break
        case "found":
          tableName = "pets_found"
          break
      }

      const { error } = await supabase.from(tableName).delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Pet excluído",
        description: "O pet foi excluído com sucesso.",
      })

      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Erro ao excluir pet:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o pet. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Determinar a URL de destino com base no tipo de pet
  const getDetailUrl = () => {
    const baseUrl = {
      adoption: "/adocao/",
      lost: "/perdidos/",
      found: "/encontrados/",
    }[type]

    return `${baseUrl}${slug || id}`
  }

  // Determinar a URL de edição com base no tipo de pet
  const getEditUrl = () => {
    switch (type) {
      case "adoption":
        return `/pets/edit/${id}`
      case "lost":
        return `/perdidos/edit/${id}`
      case "found":
        return `/encontrados/edit/${id}`
      default:
        return "/"
    }
  }

  // Mapear valores para exibição em português
  const speciesDisplay = mapPetSpecies(species, species_other)
  const sizeDisplay = mapPetSize(size, size_other)
  const genderDisplay = mapPetGender(gender, gender_other)

  // Verificar se o pet está pendente de aprovação
  const isPending = status === "pending"

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col bg-gray-900 text-white border-gray-800 hover:border-gray-700 transition-all">
        <div className="relative aspect-square">
          <Link href={getDetailUrl()}>
            <Image
              src={image || "/placeholder.svg?height=300&width=300&query=pet"}
              alt={name || "Pet"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isSpecialNeeds && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-full">
                <AlertTriangle size={16} />
              </div>
            )}
            {status && (
              <div
                className={`absolute top-2 left-2 ${
                  statusMap[status]?.color || "bg-gray-500"
                } text-white text-xs px-2 py-1 rounded-full flex items-center`}
              >
                {statusMap[status]?.icon}
                {statusMap[status]?.label || status}
              </div>
            )}
          </Link>
        </div>
        <CardContent className="flex-grow p-4">
          <Link href={getDetailUrl()}>
            <h3 className="font-bold text-lg mb-2 truncate">{name || "Pet sem nome"}</h3>
          </Link>
          <div className="space-y-1 text-sm">
            {species && (
              <p>
                <span className="font-medium">Espécie:</span> {speciesDisplay}
              </p>
            )}
            {age && (
              <p>
                <span className="font-medium">Idade:</span> {age}
              </p>
            )}
            {size && (
              <p>
                <span className="font-medium">Porte:</span> {sizeDisplay}
              </p>
            )}
            {gender && (
              <p>
                <span className="font-medium">Gênero:</span> {genderDisplay}
              </p>
            )}
            {isPending && isOwner && (
              <p className="mt-2 text-yellow-400 text-xs">
                Este pet está aguardando aprovação e só é visível para você.
              </p>
            )}
          </div>
        </CardContent>
        {isOwner && (
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href={getEditUrl()}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o pet e removerá os dados do nosso
              servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
