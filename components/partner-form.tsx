"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPartner, updatePartner } from "@/app/actions/partner-actions"
import { PartnerImageUpload } from "@/components/partner-image-upload"
import { AlertCircle, Loader2 } from "lucide-react"

interface Partner {
  id: string
  name: string
  description: string
  image_url: string
  website_url?: string
  city?: string
  state?: string
}

interface PartnerFormProps {
  partner?: Partner
}

export function PartnerForm({ partner }: PartnerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(partner?.image_url || "")

  const isEditing = !!partner

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      // Adicionar a URL da imagem ao FormData
      formData.append("image_url", imageUrl)

      let result

      if (isEditing) {
        result = await updatePartner(partner.id, formData)
      } else {
        result = await createPartner(formData)
      }

      if (result.success) {
        router.push("/admin/partners")
        router.refresh()
      } else {
        setError(result.error || "Ocorreu um erro ao salvar o parceiro")
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleImageUpload(url: string) {
    setImageUrl(url)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Parceiro *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={partner?.name || ""}
          required
          placeholder="Nome da empresa ou organização"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={partner?.description || ""}
          required
          placeholder="Breve descrição sobre o parceiro"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagem/Logo *</Label>
        <PartnerImageUpload initialImage={partner?.image_url} onImageUploaded={handleImageUpload} />
        {!imageUrl && <p className="text-red-500 text-sm mt-1">A imagem é obrigatória</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website (opcional)</Label>
        <Input
          id="website_url"
          name="website_url"
          defaultValue={partner?.website_url || ""}
          placeholder="https://exemplo.com.br"
          type="url"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade (opcional)</Label>
          <Input id="city" name="city" defaultValue={partner?.city || ""} placeholder="São Paulo" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado (opcional)</Label>
          <Input id="state" name="state" defaultValue={partner?.state || ""} placeholder="SP" maxLength={2} />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting || !imageUrl}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Atualizar Parceiro" : "Cadastrar Parceiro"}
        </Button>
      </div>
    </form>
  )
}
