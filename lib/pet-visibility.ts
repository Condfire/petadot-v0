/**
 * Checks if a pet's status is considered "approved"
 */
export function isApprovedStatus(status: string | null | undefined): boolean {
  if (!status || typeof status !== "string") return false
  const normalizedStatus = status.toLowerCase().trim()
  return normalizedStatus === "approved" || normalizedStatus === "aprovado"
}

/**
 * Determines if a pet should be visible to a specific user
 */
export function isPetVisibleToUser(pet: any, userId: string | null | undefined): boolean {
  if (!pet) return false

  const status = pet.status?.toLowerCase() || ""

  // Approved pets are visible to everyone
  if (isApprovedStatus(pet.status)) {
    return true
  }

  // For rejected or pending pets, check if the current user is the owner
  if (status === "rejected" || status === "rejeitado" || status === "pending" || status === "pendente") {
    return !!userId && pet.user_id === userId
  }

  // Default to not showing the pet if status is unknown
  return false
}

/**
 * Gets a display name for a pet status
 */
export function getPetStatusDisplayName(status: string | null | undefined): string {
  if (!status) return "Desconhecido"

  const normalizedStatus = status.toLowerCase().trim()

  if (normalizedStatus === "approved" || normalizedStatus === "aprovado") {
    return "Aprovado"
  } else if (normalizedStatus === "rejected" || normalizedStatus === "rejeitado") {
    return "Rejeitado"
  } else if (normalizedStatus === "pending" || normalizedStatus === "pendente") {
    return "Pendente"
  } else if (normalizedStatus === "adopted" || normalizedStatus === "adotado") {
    return "Adotado"
  } else if (normalizedStatus === "found" || normalizedStatus === "encontrado") {
    return "Encontrado"
  } else if (normalizedStatus === "reunited" || normalizedStatus === "reunido") {
    return "Reunido"
  }

  return status // Return the original if no match
}
