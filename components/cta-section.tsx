"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import AnimateOnScroll from "./animate-on-scroll"
import { OptimizedImage } from "./optimized-image"

export default function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-primary/5 border-t border-border/40">
      <div className="container">
        <AnimateOnScroll>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <OptimizedImage
                    src="/urban-walk.png"
                    alt="Passeio urbano com cachorro"
                    width={300}
                    height={300}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <OptimizedImage
                    src="/cozy-companion.png"
                    alt="Companheiro aconchegante"
                    width={300}
                    height={300}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <OptimizedImage
                    src="/community-garden-helper.png"
                    alt="Ajudante no jardim comunitário"
                    width={300}
                    height={300}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <OptimizedImage
                    src="/golden-retriever-park.png"
                    alt="Golden retriever no parque"
                    width={300}
                    height={300}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Faça a Diferença Hoje</h2>
              <p className="text-muted-foreground mb-6">
                Seja adotando um pet, ajudando a encontrar um animal perdido, ou apoiando uma ONG, cada ação conta.
                Junte-se a nós nessa missão de criar um mundo melhor para os animais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/register">Criar Conta</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sobre">Saiba Mais</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
