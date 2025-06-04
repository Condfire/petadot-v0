import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrint, Search, Heart } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="relative">
      {/* Background Image - Usando a abordagem mais simples possível */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-image.jpg"
          alt="Pets esperando por um lar"
          className="w-full h-full object-cover brightness-[0.4]"
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 z-[1] opacity-70"></div>

      {/* Animated paw prints */}
      <div className="absolute inset-0 z-[2] overflow-hidden">
        <PawPrint
          size={40}
          className="absolute text-white/10 top-[10%] left-[5%] animate-bounce-slow"
          style={{ animationDelay: "0s" }}
        />
        <PawPrint
          size={30}
          className="absolute text-white/10 top-[20%] left-[15%] animate-bounce-slow"
          style={{ animationDelay: "0.5s" }}
        />
        <PawPrint
          size={50}
          className="absolute text-white/10 top-[15%] right-[10%] animate-bounce-slow"
          style={{ animationDelay: "1s" }}
        />
        <PawPrint
          size={35}
          className="absolute text-white/10 top-[30%] right-[20%] animate-bounce-slow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20 md:py-32 lg:py-40">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Encontre um amigo para a vida toda
          </h1>
          <p className="text-xl text-muted-foreground">
            Adote, ajude a encontrar pets perdidos ou colabore com ONGs. Juntos podemos fazer a diferença na vida de
            muitos animais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="group">
              <Link href="/adocao">
                <Heart className="mr-2 h-5 w-5 group-hover:text-red-200 transition-colors" /> Quero Adotar
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="group">
              <Link href="/perdidos">
                <Search className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" /> Reportar Pet Perdido
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-background">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </div>
  )
}
