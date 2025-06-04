import Link from "next/link"
import Image from "next/image"
import { Heart, Instagram, Facebook, Twitter, Mail, PawPrint } from "lucide-react"

export default function Footer() {
  // Construir a URL do logo do bucket do Supabase
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/logo.png`

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 overflow-hidden">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt="PetAdot Logo"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                PetAdot
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Conectando pets a novos lares e ajudando a encontrar os que se perderam.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PawPrint size={18} className="text-primary" /> Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/adocao"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Heart size={14} />
                  Adotar um Pet
                </Link>
              </li>
              <li>
                <Link
                  href="/perdidos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Reportar Pet Perdido
                </Link>
              </li>
              <li>
                <Link
                  href="/encontrados"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Reportar Pet Encontrado
                </Link>
              </li>
              <li>
                <Link
                  href="/eventos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PawPrint size={18} className="text-primary" /> Sobre
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Nossa Missão
                </Link>
              </li>
              <li>
                <Link
                  href="/ongs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  ONGs Parceiras
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre#como-ajudar"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Como Ajudar
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre#contato"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <PawPrint size={14} />
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PawPrint size={18} className="text-primary" /> Siga-nos
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 rounded-full hover:bg-muted"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 rounded-full hover:bg-muted"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-2 rounded-full hover:bg-muted"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Inscreva-se para receber novidades</p>
              <div className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button className="inline-flex items-center justify-center rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <Mail size={16} className="mr-1" /> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PetAdot. Todos os direitos reservados.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 md:mt-0">
            Feito com <Heart size={16} className="mx-1 text-red-500 animate-pulse-slow" /> para todos os pets
          </p>
        </div>
      </div>
    </footer>
  )
}
