"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/auth-provider"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export default function OngLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const { user, isInitialized, signIn } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    async function checkSession() {
      if (!isInitialized) return

      if (user) {
        try {
          const { data: ongData, error: ongError } = await supabase
            .from("ongs")
            .select("id")
            .eq("user_id", user.id)
            .single()

          if (!ongError && ongData) {
            router.push("/ongs/dashboard")
            return
          }
        } catch (err) {
          console.error("Erro ao verificar sessão:", err)
        }
      }

      setIsCheckingSession(false)
    }

    checkSession()
  }, [router, user, isInitialized])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(data.email, data.password)

      if (!result.success) {
        throw new Error(result.error || "Erro ao fazer login")
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user?.id
      if (!userId) {
        throw new Error("Usuário não encontrado")
      }

      const { data: ongData, error: ongError } = await supabase
        .from("ongs")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (ongError) {
        await supabase.auth.signOut()
        throw new Error("Este usuário não está associado a nenhuma ONG")
      }

      router.push("/ongs/dashboard")
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login de ONG</CardTitle>
          <CardDescription>Acesse sua conta de organização</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ong@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/ongs/register" className="text-primary hover:underline">
              Cadastre sua ONG
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link href="/ongs" className="text-primary hover:underline">
              Voltar para ONGs
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
