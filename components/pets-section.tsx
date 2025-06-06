"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/section-header"
import AnimateOnScroll from "@/components/animate-on-scroll"
import PetCard from "@/components/PetCard"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function PetsSection() {
  const [adoptionPets, setAdoptionPets] = useState([])
  const [lostPets, setLostPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPets() {
      try {
        setLoading(true)

        // Buscar pets para adoção
        const { data: adoptionData, error: adoptionError } = await supabase
          .from("pets")
          .select("*")
          .eq("category", "adoption")
          .in("status", ["approved", "aprovado"])
          .order("created_at", { ascending: false })
          .limit(4)

        if (adoptionError) {
          console.error("Erro ao buscar pets para adoção:", adoptionError)
        } else {
          setAdoptionPets(adoptionData || [])
        }

        // Buscar pets perdidos
        const { data: lostData, error: lostError } = await supabase
          .from("pets")
          .select("*")
          .eq("category", "lost")
          .in("status", ["approved", "aprovado"])
          .order("created_at", { ascending: false })
          .limit(4)

        if (lostError) {
          console.error("Erro ao buscar pets perdidos:", lostError)
        } else {
          setLostPets(lostData || [])
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [supabase])

  if (loading) {
    return (
      <div className="container py-12 md:py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando pets...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Seção de Pets para Adoção */}
      <section className="container py-12 md:py-16">
        <AnimateOnScroll>
          <SectionHeader title="Pets para Adoção" description="Encontre seu novo melhor amigo" viewAllLink="/adocao" />
        </AnimateOnScroll>

        {Array.isArray(adoptionPets) && adoptionPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {adoptionPets.map((pet, index) => {
              if (!pet || !pet.id) return null

              return (
                <AnimateOnScroll key={pet.id} delay={index * 100}>
                  <PetCard pet={pet} />
                </AnimateOnScroll>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
            <p className="text-muted-foreground mb-4">
              {error
                ? "Erro ao carregar pets. Tente novamente mais tarde."
                : "Ainda não há pets para adoção aprovados. Seja o primeiro a cadastrar um pet!"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/adocao/cadastrar">Cadastrar Pet para Adoção</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Seção de Pets Perdidos */}
      <section className="container py-12 md:py-16 border-t border-border/40">
        <AnimateOnScroll>
          <SectionHeader
            title="Pets Perdidos"
            description="Ajude estes pets a voltarem para casa"
            viewAllLink="/perdidos"
          />
        </AnimateOnScroll>

        {Array.isArray(lostPets) && lostPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {lostPets.map((pet, index) => {
              if (!pet || !pet.id) return null

              return (
                <AnimateOnScroll key={pet.id} delay={index * 100}>
                  <PetCard pet={pet} />
                </AnimateOnScroll>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg mt-8">
            <p className="text-muted-foreground mb-4">
              {error
                ? "Erro ao carregar pets perdidos. Tente novamente mais tarde."
                : "Não há pets perdidos aprovados registrados no momento. Isso é uma boa notícia!"}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
