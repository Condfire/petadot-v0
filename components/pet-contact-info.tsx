"use client"

import { Mail, Phone, User } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

interface PetContactInfoProps {
  name?: string
  email?: string
  phone?: string
  className?: string
}

export function PetContactInfo({ name, email, phone, className = "" }: PetContactInfoProps) {
  // Verificar se há pelo menos uma informação de contato
  const hasContactInfo = [name, email, phone].some((val) => val !== undefined && val !== null && val !== "")

  if (!hasContactInfo) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">Informações de Contato</h3>
          <p className="text-muted-foreground mt-2">Nenhuma informação de contato disponível.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 grid gap-3">
        <h3 className="text-lg font-semibold">Informações de Contato</h3>

        <div className="grid gap-2">
          {name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{name}</span>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 ml-auto"
                onClick={() => (window.location.href = `mailto:${email}`)}
              >
                Enviar email
              </Button>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{phone}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 ml-auto"
                onClick={() => (window.location.href = `tel:${phone}`)}
              >
                Ligar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
