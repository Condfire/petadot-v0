"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { createAdoptionPetByOng } from "@/app/actions/pet-actions"

const petFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  species: z.enum(["dog", "cat", "other"], { required_error: "Selecione a espécie." }),
  breed: z.string().min(2, "A raça deve ter pelo menos 2 caracteres."),
  size: z.enum(["small", "medium", "large"], { required_error: "Selecione o porte." }),
  gender: z.enum(["male", "female"], { required_error: "Selecione o gênero." }),
  age: z.string().min(1, "A idade é obrigatória."),
  color: z.string().min(2, "A cor é obrigatória."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  special_needs: z.string().optional(),
  main_image_url: z.string().url("Por favor, faça o upload de uma imagem.").min(1, "A imagem principal é obrigatória."),
  // Adicione outros campos de imagem se necessário
})

type PetFormValues = z.infer<typeof petFormSchema>

export default function CadastrarPetClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: undefined,
      breed: "",
      size: undefined,
      gender: undefined,
      age: "",
      color: "",
      description: "",
      special_needs: "",
      main_image_url: "",
    },
  })

  async function onSubmit(data: PetFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createAdoptionPetByOng(data)
      if (!result.success) {
        throw new Error(result.error || "Falha ao cadastrar o pet.")
      }
      router.push("/ongs/dashboard?success=Pet cadastrado com sucesso!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Pet para Adoção</h1>
          <p className="text-muted-foreground">Adicione um novo pet disponível para adoção pela sua ONG.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no Cadastro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Imagem do Pet</CardTitle>
                  <CardDescription>A primeira foto será a principal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="main_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            onImageUploaded={(url) => field.onChange(url)}
                            value={field.value}
                            folder="pets"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bob" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Espécie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a espécie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dog">Cachorro</SelectItem>
                              <SelectItem value="cat">Gato</SelectItem>
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
                            <Input placeholder="Ex: Vira-lata" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 2 anos" {...field} />
                          </FormControl>
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
                        <FormLabel>Cor Predominante</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Caramelo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição / Comportamento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a personalidade do pet, se é dócil, medroso, brincalhão, etc."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="special_needs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Necessidades Especiais (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Alergia a frango, precisa de remédio, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Pet
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
