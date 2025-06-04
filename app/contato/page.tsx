"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { submitContactForm } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await submitContactForm(formData)

      if (result.success) {
        toast({
          title: "Mensagem enviada",
          description: result.message,
          variant: "default",
        })

        // Limpar o formulário
        const form = document.getElementById("contactForm") as HTMLFormElement
        form.reset()
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Entre em Contato</h1>
        <p className="text-xl text-muted-foreground">
          Tem dúvidas, sugestões ou quer estabelecer uma parceria? Estamos aqui para ajudar.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-muted/30 p-8 rounded-lg">
        <div className="mb-8 flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-6">
          Preencha o formulário abaixo e entraremos em contato o mais breve possível.
        </p>

        <form id="contactForm" action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Assunto
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Assunto da mensagem"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Sua mensagem"
              required
            ></textarea>
          </div>
          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
            </Button>
          </div>
        </form>
      </div>

      <div className="max-w-2xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Outras Formas de Contato</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">E-mail</h3>
            <p className="text-muted-foreground">contato@petadot.com.br</p>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Redes Sociais</h3>
            <p className="text-muted-foreground">@petadot.oficial</p>
          </div>
        </div>
      </div>
    </div>
  )
}
