import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface PetResolvedAlertProps {
  type: "adoption" | "lost" | "found"
  date?: string
}

export function PetResolvedAlert({ type, date }: PetResolvedAlertProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return ""
    }
  }

  const getTitle = () => {
    switch (type) {
      case "adoption":
        return "Pet Adotado"
      case "lost":
        return "Pet Encontrado"
      case "found":
        return "Pet Reunido com o Dono"
      default:
        return "Status Resolvido"
    }
  }

  const getDescription = () => {
    const formattedDate = formatDate(date)
    const dateText = formattedDate ? ` em ${formattedDate}` : ""

    switch (type) {
      case "adoption":
        return `Este pet foi adotado e encontrou um novo lar${dateText}.`
      case "lost":
        return `Este pet perdido foi encontrado${dateText}.`
      case "found":
        return `Este pet encontrado foi reunido com seu dono${dateText}.`
      default:
        return `Este caso foi resolvido${dateText}.`
    }
  }

  const getAlertClass = () => {
    switch (type) {
      case "adoption":
        return "bg-pink-50 border-pink-200 text-pink-800"
      case "lost":
        return "bg-green-50 border-green-200 text-green-800"
      case "found":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return ""
    }
  }

  return (
    <Alert className={getAlertClass()}>
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription>{getDescription()}</AlertDescription>
    </Alert>
  )
}
