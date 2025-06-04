"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

// Esquema de validação
const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
})

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await resetPassword(values.email)

      if (result.success) {
        setSuccess(true)
        form.reset()
      } else {
        setError(result.error || "Falha ao enviar email de recuperação. Tente novamente.")
      }
    } catch (error) {
      setError("Ocorreu um erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Recuperar Senha</h1>
          <p className="text-muted-foreground">Informe seu email para receber instruções de recuperação de senha.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>Email enviado!</AlertTitle>
            <AlertDescription>
              Enviamos um email com instruções para recuperar sua senha. Verifique sua caixa de entrada.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recuperação de Senha</CardTitle>
            <CardDescription>
              Informe seu email de cadastro para receber um link de recuperação de senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Lembrou sua senha?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Voltar para login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
