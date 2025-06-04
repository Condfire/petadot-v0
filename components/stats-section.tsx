"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Heart, PawPrint, Users, Calendar } from "lucide-react"
import AnimateOnScroll from "@/components/animate-on-scroll"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface StatItemProps {
  icon: React.ReactNode
  value: string
  label: string
  delay?: number
}

function StatItem({ icon, value, label, delay = 0 }: StatItemProps) {
  return (
    <AnimateOnScroll delay={delay} className="flex flex-col items-center text-center p-4">
      <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </AnimateOnScroll>
  )
}

export default function StatsSection() {
  const [adopted, setAdopted] = useState<number>(0)
  const [reunited, setReunited] = useState<number>(0)
  const [ongsCount, setOngsCount] = useState<number>(0)
  const [eventsCount, setEventsCount] = useState<number>(0)

  useEffect(() => {
    getStats()
  }, [])

  const getStats = async () => {
    const supabase = createClientComponentClient()
    console.log("🔍 Buscando estatísticas...")

    // Buscar pets adotados
    const { count: adoptedCount, error: adoptedError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("status", "adopted")

    if (adoptedError) {
      console.error("Erro ao buscar pets adotados:", adoptedError)
    }

    setAdopted(adoptedCount || 0)

    // Buscar pets reencontrados (resolved OU reunited)
    const { count: reunitedCount, error: reunitedError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .or("resolved.eq.true,reunited.eq.true")

    if (reunitedError) {
      console.error("Erro ao buscar pets reencontrados:", reunitedError)
    }

    setReunited(reunitedCount || 0)

    // Buscar número de ONGs
    const { count: ongs, error: ongsError } = await supabase.from("ongs").select("*", { count: "exact", head: true })

    if (ongsError) {
      console.error("Erro ao buscar número de ONGs:", ongsError)
    }

    setOngsCount(ongs || 0)

    // Buscar número de eventos
    const { count: events, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) {
      console.error("Erro ao buscar número de eventos:", eventsError)
    }

    setEventsCount(events || 0)

    console.log("📊 Pets adotados:", adoptedCount || 0)
    console.log("🏠 Pets reencontrados:", reunitedCount || 0)
    console.log("🏢 ONGs:", ongs || 0)
    console.log("📅 Eventos:", events || 0)
  }

  return (
    <section className="bg-muted/30 py-12 border-y border-border/40">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Nosso Impacto</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Juntos estamos fazendo a diferença na vida de muitos animais. Confira alguns números do nosso trabalho.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem icon={<PawPrint size={32} />} value={`${adopted}+`} label="Pets adotados" delay={0} />
          <StatItem icon={<Heart size={32} />} value={`${reunited}+`} label="Pets reencontrados" delay={100} />
          <StatItem icon={<Users size={32} />} value={`${ongsCount}+`} label="ONGs parceiras" delay={200} />
          <StatItem icon={<Calendar size={32} />} value={`${eventsCount}+`} label="Eventos realizados" delay={300} />
        </div>
      </div>
    </section>
  )
}
