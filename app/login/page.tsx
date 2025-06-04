"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClientComponentClient()

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Login page: Verificando autenticação...")
        setIsCheckingAuth(true)

        // Obter a sessão atual
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Login page: Erro ao verificar sessão:", error)
          setIsCheckingAuth(false)
          return
        }

        if (data.session) {
          console.log("Login page: Usuário já autenticado, redirecionando...")
          router.push(redirectTo)
        } else {
          console.log("Login page: Nenhuma sessão ativa")
          setIsCheckingAuth(false)
        }
      } catch (err) {
        console.error("Login page: Erro durante verificação de autenticação:", err)
        setIsCheckingAuth(false)
      }
    }

    // Verificar autenticação apenas se não estiver em um ambiente de servidor
    if (typeof window !== "undefined") {
      checkAuth()
    } else {
      setIsCheckingAuth(false)
    }

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Login page: Evento de autenticação:", event)

      if (session) {
        console.log("Login page: Usuário autenticado via evento, redirecionando...")
        router.push(redirectTo)
      }
    })

    // Cleanup function
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [supabase.auth, router, redirectTo])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Login page: Tentando fazer login...")
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error("Login page: Erro de login:", error)
        throw new Error(error.message)
      }

      console.log("Login page: Login bem-sucedido, verificando sessão...")

      // Verificar se a sessão foi criada corretamente
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Login page: Falha ao obter sessão após login:", sessionError)
        throw new Error("Falha ao obter sessão após login")
      }

      if (!sessionData.session) {
        console.error("Login page: Sessão não encontrada após login")
        throw new Error("Sessão não encontrada após login")
      }

      console.log("Login page: Sessão confirmada, redirecionando...")

      // Redirecionar para a página solicitada ou dashboard
      const newRedirectTo = redirectTo === "/admin" ? "/admin-alt" : redirectTo
      router.push(newRedirectTo)
    } catch (err) {
      console.error("Login page: Erro durante login:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao fazer login")
      setIsLoading(false)
    }
  }

  // Verificar se há uma mensagem nos parâmetros de consulta
  const message = searchParams.get("message")

  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Entre com seu email e senha para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
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
                      <Input placeholder="seu@email.com" {...field} />
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
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="text-sm text-center">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
