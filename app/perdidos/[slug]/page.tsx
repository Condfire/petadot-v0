export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PetImageGallery } from "@/components/pet-image-gallery"
import { PetDetails } from "@/components/pet-details"
import { PetContactInfo } from "@/components/pet-contact-info"
import { ShareButtons } from "@/components/share-buttons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, User } from "lucide-react"

// Helper function to check if status is approved
function isApprovedStatus(status: string): boolean {
  const approvedStatuses = ["approved", "aprovado", "ativo", "active"]
  return approvedStatuses.includes(status?.toLowerCase() || "")
}

export default async function PetDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get pet by slug
  const { data: pet, error } = await supabase
    .from("pets")
    .select("*")
    .eq("slug", params.slug)
    .eq("category", "lost")
    .single()

  if (error || !pet) {
    notFound()
  }

  // Check if pet should be visible to current user
  const isApproved = isApprovedStatus(pet.status)
  const isOwner = user?.id === pet.user_id

  if (!isApproved && !isOwner) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Status Alert for Owner */}
        {isOwner && !isApproved && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Seu Pet:</strong> Este pet está com status "{pet.status}" e não está visível publicamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with badges */}
          <div className="p-6 border-b">
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Status Badge */}
              <Badge
                variant={isApproved ? "default" : pet.status === "pending" ? "secondary" : "destructive"}
                className={
                  isApproved
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : pet.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                }
              >
                {isApproved ? "Aprovado" : pet.status === "pending" ? "Pendente" : "Rejeitado"}
              </Badge>

              {/* Owner Badge */}
              {isOwner && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <User className="w-3 h-3 mr-1" />
                  Seu Pet
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
            <p className="text-gray-600">
              Pet Perdido em {pet.city}, {pet.state}
            </p>
          </div>

          {/* Pet Images */}
          <PetImageGallery images={pet.images || []} petName={pet.name} />

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pet Details */}
              <div>
                <PetDetails pet={pet} />
              </div>

              {/* Contact Info */}
              <div>
                <PetContactInfo pet={pet} />
              </div>
            </div>

            {/* Share Buttons */}
            {isApproved && (
              <div className="mt-8 pt-6 border-t">
                <ShareButtons
                  url={`${process.env.NEXT_PUBLIC_APP_URL}/perdidos/${pet.slug}`}
                  title={`Ajude a encontrar ${pet.name}`}
                  description={`${pet.name} está perdido em ${pet.city}, ${pet.state}. Ajude a reunir esta família!`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
