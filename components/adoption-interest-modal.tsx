"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, AlertTriangle, MessageSquare } from "lucide-react"

interface AdoptionInterestModalProps {
  petId?: string
  petName?: string
  ongId?: string
  contactPhone?: string | null
  ongName?: string
  className?: string
}

export function AdoptionInterestModal({
  petId,
  petName = "este pet",
  ongId,
  contactPhone,
  ongName = "ONG responsável",
  className,
}: AdoptionInterestModalProps) {
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)

  const handleWhatsAppClick = () => {
    // Verificar se temos um número de telefone
    if (!contactPhone) {
      alert(
        "Não foi possível encontrar um número de telefone para contato. Por favor, entre em contato com a ONG por outros meios.",
      )
      return
    }

    // Formatar o número de telefone (remover caracteres não numéricos)
    const formattedPhone = contactPhone.replace(/\D/g, "")

    // Verificar se o número está vazio após a formatação
    if (!formattedPhone) {
      alert("O número de telefone fornecido é inválido. Por favor, entre em contato com a ONG por outros meios.")
      return
    }

    // Construir a mensagem
    const whatsappMessage = `Olá! Vi o anúncio de adoção do pet ${petName} no PetAdot e tenho interesse em adotá-lo. ${
      message ? `\n\nMensagem adicional: ${message}` : ""
    }`

    // Construir a URL do WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`

    // Abrir o WhatsApp em uma nova aba
    window.open(whatsappUrl, "_blank")

    // Fechar o modal
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`gap-2 ${className}`} variant="default">
          <Heart className="h-4 w-4" />
          Tenho Interesse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Interesse em Adoção</DialogTitle>
          <DialogDescription>
            Envie uma mensagem para a {ongName} demonstrando seu interesse em adotar {petName}.
          </DialogDescription>
        </DialogHeader>

        {!contactPhone && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Informação de contato indisponível</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar um número de telefone para contato. Por favor, tente entrar em contato com a
              ONG por outros meios.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Conte um pouco sobre você e por que gostaria de adotar este pet..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleWhatsAppClick} className="gap-2" disabled={!contactPhone}>
            <MessageSquare className="h-4 w-4" />
            Enviar mensagem via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
