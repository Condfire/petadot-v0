"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Building2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ImageUpload"

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional(),
  avatar_url: z.string().optional(),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "A senha atual deve ter pelo menos 6 caracteres" }),
    newPassword: z.string().min(6, { message: "A nova senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirme a nova senha" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function ProfileContent() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isOngAdmin, setIsOngAdmin] = useState(false)
  const [ongId, setOngId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar_url: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await supabase.auth.getUser()

        if (data?.user) {
          setUser(data.user)

          // Buscar dados adicionais do usuário
          const { data: userData, error: userDataError } = await supabase
            .from("users")
            .select("name, avatar_url")
            .eq("id", data.user.id)
            .single()

          if (!userDataError && userData) {
            // Atualizar formulário com dados do usuário
            profileForm.reset({
              name: userData.name || data.user.user_metadata?.name || "",
              email: data.user.email || "",
              avatar_url: userData.avatar_url || "",
            })
          } else {
            profileForm.reset({
              name: data.user.user_metadata?.name || "",
              email: data.user.email || "",
              avatar_url: "",
            })
          }

          // Verificar se o usuário é administrador de alguma ONG
          try {
            const { data: ongData, error: ongError } = await supabase
              .from("ongs")
              .select("id")
              .eq("user_id", data.user.id)
              .single()

            if (!ongError && ongData) {
              setIsOngAdmin(true)
              setOngId(ongData.id)
            }
          } catch (err) {
            console.error("Erro ao verificar status de admin de ONG:", err)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, profileForm])

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Atualizar os metadados do usuário
      const { error } = await supabase.auth.updateUser({
        data: { name: data.name },
      })

      if (error) throw new Error(error.message)

      // Atualizar a tabela de usuários
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: data.name,
          avatar_url: data.avatar_url,
        })
        .eq("id", user?.id)

      if (updateError) throw new Error(updateError.message)

      setSuccess("Perfil atualizado com sucesso!")
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      setError("Ocorreu um erro ao atualizar o perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (error) throw new Error(error.message)

      setSuccess("Senha atualizada com sucesso!")
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("Erro ao atualizar senha:", err)
      setError("Ocorreu um erro ao atualizar a senha")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        {isOngAdmin && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => (window.location.href = "/ongs/dashboard")}
          >
            <Building2 className="h-4 w-4" />
            Área da ONG
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="password">Alterar Senha</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profileForm.watch("avatar_url") || ""} alt="Foto de perfil" />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-12 w-12 text-primary" />
                      </AvatarFallback>
                    </Avatar>

                    <FormField
                      control={profileForm.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem className="w-full max-w-xs">
                          <FormControl>
                            <ImageUpload
                              value={field.value || ""}
                              onChange={field.onChange}
                              folder="avatars"
                              className="w-full h-full object-cover"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar alterações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Atualizar Senha
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
