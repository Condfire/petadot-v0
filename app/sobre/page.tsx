import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, PawPrint, Search, Calendar, Users, Mail } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"

export const metadata: Metadata = {
  title: "Sobre o PetAdot | Adoção, Pets Perdidos e Encontrados",
  description: "Conheça a missão do PetAdot, como funciona a plataforma e como você pode ajudar a causa animal.",
}

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Sobre o PetAdot</h1>
        <p className="text-xl text-muted-foreground">
          Conectando pets a novos lares e ajudando a encontrar os que se perderam.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
          <p className="text-muted-foreground mb-4">
            O PetAdot nasceu da necessidade de criar uma plataforma unificada que conecte pessoas que desejam adotar
            pets, ajude a encontrar animais perdidos e apoie o trabalho das ONGs de proteção animal.
          </p>
          <p className="text-muted-foreground mb-4">
            Acreditamos que todo animal merece um lar amoroso e cuidados adequados. Nossa missão é facilitar esse
            encontro e contribuir para a redução do número de animais abandonados.
          </p>
          <p className="text-muted-foreground">
            Trabalhamos em parceria com ONGs e protetores independentes, oferecendo uma plataforma gratuita para
            divulgação de pets para adoção, pets perdidos e encontrados, além de eventos relacionados à causa animal.
          </p>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <OptimizedImage
            src="/about-image.jpg"
            alt="Pessoas ajudando animais"
            width={640}
            height={360}
            className="w-full h-full"
            objectFit="cover"
          />
        </div>
      </div>

      <div className="mb-16" id="como-funciona">
        <h2 className="text-2xl font-bold mb-8 text-center">Como Funciona</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Adoção</h3>
            <p className="text-muted-foreground text-center">
              ONGs e protetores cadastram pets disponíveis para adoção. Pessoas interessadas podem entrar em contato
              diretamente.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Search className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Pets Perdidos e Encontrados</h3>
            <p className="text-muted-foreground text-center">
              Tutores podem cadastrar pets perdidos e pessoas que encontraram um animal podem divulgar para facilitar o
              reencontro.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Eventos</h3>
            <p className="text-muted-foreground text-center">
              Divulgação de feiras de adoção, campanhas de castração, vacinação e outros eventos relacionados à causa
              animal.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">ONGs</h3>
            <p className="text-muted-foreground text-center">
              Cadastro de organizações que trabalham com proteção animal, facilitando o contato com pessoas interessadas
              em adotar ou ajudar.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Apoio</h3>
            <p className="text-muted-foreground text-center">
              Informações sobre como apoiar ONGs e protetores através de doações, apadrinhamento ou trabalho voluntário.
            </p>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Contato</h3>
            <p className="text-muted-foreground text-center">
              Canal direto para dúvidas, sugestões ou parcerias. Estamos sempre abertos a melhorar nossa plataforma.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16" id="como-ajudar">
        <h2 className="text-2xl font-bold mb-8 text-center">Como Você Pode Ajudar</h2>
        <div className="bg-muted p-8 rounded-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Adote um Pet</h3>
              <p className="text-muted-foreground mb-4">
                A adoção é um ato de amor e responsabilidade. Ao adotar, você não apenas ganha um amigo fiel, mas também
                abre espaço para que as ONGs possam resgatar mais animais.
              </p>
              <Button asChild className="mb-8">
                <Link href="/adocao">Ver Pets para Adoção</Link>
              </Button>

              <h3 className="text-xl font-bold mb-4">Seja Voluntário</h3>
              <p className="text-muted-foreground mb-4">
                ONGs sempre precisam de ajuda em diversas áreas: cuidados com os animais, transporte, divulgação,
                eventos, etc. Ofereça seu tempo e habilidades.
              </p>
              <Button asChild variant="outline">
                <Link href="/ongs">Contatar ONGs</Link>
              </Button>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Doe</h3>
              <p className="text-muted-foreground mb-4">
                As ONGs dependem de doações para manter seus trabalhos. Você pode doar dinheiro, ração, medicamentos,
                cobertores, ou outros itens necessários.
              </p>
              <Button asChild className="mb-8">
                <Link href="/ongs">Ver ONGs para Doar</Link>
              </Button>

              <h3 className="text-xl font-bold mb-4">Divulgue</h3>
              <p className="text-muted-foreground mb-4">
                Compartilhe pets para adoção e perdidos em suas redes sociais. Quanto mais pessoas virem, maiores as
                chances de encontrar um lar ou o tutor.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Compartilhar PetAdot</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="contato">
        <h2 className="text-2xl font-bold mb-8 text-center">Entre em Contato</h2>
        <div className="max-w-2xl mx-auto bg-muted/30 p-8 rounded-lg">
          <p className="text-center text-muted-foreground mb-6">
            Tem dúvidas, sugestões ou quer estabelecer uma parceria? Entre em contato conosco.
          </p>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="seu@email.com"
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Assunto da mensagem"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Sua mensagem"
              ></textarea>
            </div>
            <div className="flex justify-center">
              <Button type="submit">Enviar Mensagem</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
