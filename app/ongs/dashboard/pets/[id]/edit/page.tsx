"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ImageUpload from "@/components/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const petFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  species: z.string().min(1, { message: "Selecione a espécie" }),
  breed: z.string().min(1, { message: "Informe a raça" }),
  age: z.coerce.number().min(0, { message: "A idade deve ser maior ou igual a 0" }),
  size: z.string().min(1, { message: "Selecione o porte" }),
  gender: z.string().min(1, { message: "Selecione o gênero" }),
  color: z.string().optional(),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  is_castrated: z.boolean().default(false),
  is_vaccinated: z.boolean().default(false),
  is_special_needs: z.boolean().default(false),
  special_needs_description: z.string().optional(),
  image_url: z.string().optional(),
})

type PetFormValues = z.infer<typeof petFormSchema>

export default function EditPetPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [ongId, setOngId] = useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const router = useRouter()

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      age: 0,
      size: "",
      gender: "",
      color: "",
      description: "",
      is_castrated: false,
      is_vaccinated: false,
      is_special_needs: false,
      special_needs_description: "",
      image_url: "",
    },
  })

  useEffect(() => {
    async function loadPet() {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push("/ongs/login?message=Faça login para editar pets")
          return
        }

        const userId = session.user.id

        // Buscar a ONG do usuário
        const { data: ongData, error: ongError } = await supabase
          .from("ongs")
          .select("id")
          .eq("user_id", userId)
          .single()

        if (ongError || !ongData) {
          throw new Error("ONG não encontrada")
        }

        setOngId(ongData.id)

        // Buscar o pet
        const { data: pet, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", params.id)
          .eq("ong_id", ongData.id)
          .single()

        if (petError) {
          if (petError.code === "PGRST116") {
            throw new Error("Pet não encontrado ou você não tem permissão para editá-lo")
          }
          throw new Error(petError.message)
        }

        // Preencher o formulário com os dados do pet
        form.reset({
          name: pet.name,
          species: pet.species,
          breed: pet.breed || "",
          age: pet.age || 0,
          size: pet.size,
          gender: pet.gender,
          color: pet.color || "",
          description: pet.description,
          is_castrated: pet.is_castrated || false,
          is_vaccinated: pet.is_vaccinated || false,
          is_special_needs: pet.is_special_needs || false,
          special_needs_description: pet.special_needs_description || "",
          image_url: pet.image_url,
        })

        setImageUrl(pet.image_url)
      } catch (err: any) {
        console.error("Erro ao carregar pet:", err)
        setError(err.message || "Ocorreu um erro ao carregar o pet")
      } finally {
        setIsLoading(false)
      }
    }

    loadPet()
  }, [params.id, router, form])

  const onSubmit = async (data: PetFormValues) => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      if (!ongId) {
        throw new Error("ID da ONG não encontrado")
      }

      // Adicionar a URL da imagem se foi enviada
      if (imageUrl) {
        data.image_url = imageUrl
      }

      // Atualizar o pet
      const { error } = await supabase
        .from("pets")
        .update({
          name: data.name,
          species: data.species,
          breed: data.breed,
          age: data.age,
          size: data.size,
          gender: data.gender,
          color: data.color,
          description: data.description,
          is_castrated: data.is_castrated,
          is_vaccinated: data.is_vaccinated,
          is_special_needs: data.is_special_needs,
          special_needs_description: data.special_needs_description,
          image_url: data.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .eq("ong_id", ongId)

      if (error) {
        throw new Error(error.message)
      }

      setSuccess("Pet atualizado com sucesso!")

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/ongs/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao atualizar pet:", err)
      setError(err.message || "Ocorreu um erro ao atualizar o pet")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePet = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      if (!ongId) {
        throw new Error("ID da ONG não encontrado")
      }

      // Excluir o pet
      const { error } = await supabase.from("pets").delete().eq("id", params.id).eq("ong_id", ongId)

      if (error) {
        throw new Error(error.message)
      }

      setSuccess("Pet excluído com sucesso!")

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/ongs/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao excluir pet:", err)
      setError(err.message || "Ocorreu um erro ao excluir o pet")
    } finally {
      setIsDeleting(false)
      setConfirmDeleteOpen(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    form.setValue("image_url", url)
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando informações do pet...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/ongs/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Pet</h1>
          <p className="text-muted-foreground">Atualize as informações do pet para adoção</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Foto do Pet</CardTitle>
            <CardDescription>Atualize a foto do pet</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageUploaded={handleImageUpload}
              defaultImage={imageUrl || undefined}
              folder="pets"
              className="w-full aspect-square object-cover rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Pet</CardTitle>
            <CardDescription>Atualize os dados do pet para adoção</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do pet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Espécie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dog">Cachorro</SelectItem>
                            <SelectItem value="cat">Gato</SelectItem>
                            <SelectItem value="bird">Ave</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raça</FormLabel>
                        <FormControl>
                          <Input placeholder="Raça ou SRD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade (anos)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Pequeno</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="large">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Macho</SelectItem>
                            <SelectItem value="female">Fêmea</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="Cor do pet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o pet, sua personalidade e necessidades"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="is_castrated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Castrado</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_vaccinated"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Vacinado</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_special_needs"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              if (!checked) {
                                form.setValue("special_needs_description", "")
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Necessidades Especiais</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("is_special_needs") && (
                  <FormField
                    control={form.control}
                    name="special_needs_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição das Necessidades Especiais</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva as necessidades especiais do pet"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between pt-4">
                  <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="destructive" disabled={isDeleting || isSaving}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Pet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePet} disabled={isDeleting}>
                          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Excluir
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button type="submit" disabled={isSaving || isDeleting}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
