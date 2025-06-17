"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { generatePetSlug, generateOngSlug, generateEventSlug, generatePartnerSlug } from "@/lib/slug-utils"
import { Loader2 } from "lucide-react"

export default function PopulateSlugsUtility() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    pets: false,
    pets_lost: false,
    pets_found: false,
    ongs: false,
    events: false,
    partners: false,
  })
  const [results, setResults] = useState<Record<string, { success: number; error: number }>>({})

  const supabase = createClientComponentClient()

  const populatePetsAdoptionSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, pets: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all pets without slugs
      const { data: pets, error } = await supabase
        .from("pets")
        .select("id, name, species, city, state, slug")
        .is("slug", null)

      if (error) throw error

      // Update each pet with a slug
      for (const pet of pets || []) {
        try {
          const slug = await generatePetSlug(
            pet.name || "pet",
            pet.species || "animal",
            pet.city,
            pet.state,
            pet.id,
            "pets",
          )

          const { error: updateError } = await supabase.from("pets").update({ slug }).eq("id", pet.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating pet slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating pet slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, pets: false }))
      setResults((prev) => ({ ...prev, pets: result }))
    }
  }

  const populatePetsLostSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, pets_lost: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all lost pets without slugs
      const { data: pets, error } = await supabase
        .from("pets_lost")
        .select("id, name, species, city, state, slug")
        .is("slug", null)

      if (error) throw error

      // Update each pet with a slug
      for (const pet of pets || []) {
        try {
          const slug = await generatePetSlug(
            pet.name || "pet",
            pet.species || "animal",
            pet.city,
            pet.state,
            pet.id,
            "pets_lost",
          )

          const { error: updateError } = await supabase.from("pets_lost").update({ slug }).eq("id", pet.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating lost pet slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating lost pet slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, pets_lost: false }))
      setResults((prev) => ({ ...prev, pets_lost: result }))
    }
  }

  const populatePetsFoundSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, pets_found: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all found pets without slugs
      const { data: pets, error } = await supabase
        .from("pets_found")
        .select("id, name, species, city, state, slug")
        .is("slug", null)

      if (error) throw error

      // Update each pet with a slug
      for (const pet of pets || []) {
        try {
          const slug = await generatePetSlug(
            pet.name || "pet",
            pet.species || "animal",
            pet.city,
            pet.state,
            pet.id,
            "pets_found",
          )

          const { error: updateError } = await supabase.from("pets_found").update({ slug }).eq("id", pet.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating found pet slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating found pet slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, pets_found: false }))
      setResults((prev) => ({ ...prev, pets_found: result }))
    }
  }

  const populateOngsSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, ongs: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all ONGs without slugs
      const { data: ongs, error } = await supabase.from("ongs").select("id, name, city, state, slug").is("slug", null)

      if (error) throw error

      // Update each ONG with a slug
      for (const ong of ongs || []) {
        try {
          const slug = await generateOngSlug(ong.name || "ong", ong.city, ong.state, ong.id)

          const { error: updateError } = await supabase.from("ongs").update({ slug }).eq("id", ong.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating ONG slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating ONG slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, ongs: false }))
      setResults((prev) => ({ ...prev, ongs: result }))
    }
  }

  const populateEventsSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, events: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all events without slugs
      const { data: events, error } = await supabase
        .from("events")
        .select("id, title, city, state, slug")
        .is("slug", null)

      if (error) throw error

      // Update each event with a slug
      for (const event of events || []) {
        try {
          const slug = await generateEventSlug(event.name || "evento", event.city, event.state, event.id)

          const { error: updateError } = await supabase.from("events").update({ slug }).eq("id", event.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating event slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating event slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, events: false }))
      setResults((prev) => ({ ...prev, events: result }))
    }
  }

  const populatePartnersSlugs = async () => {
    setIsLoading((prev) => ({ ...prev, partners: true }))
    const result = { success: 0, error: 0 }

    try {
      // Get all partners without slugs
      const { data: partners, error } = await supabase
        .from("partners")
        .select("id, name, city, state, slug")
        .is("slug", null)

      if (error) throw error

      // Update each partner with a slug
      for (const partner of partners || []) {
        try {
          const slug = await generatePartnerSlug(partner.name || "parceiro", partner.city, partner.state, partner.id)

          const { error: updateError } = await supabase.from("partners").update({ slug }).eq("id", partner.id)

          if (updateError) throw updateError
          result.success++
        } catch (err) {
          console.error("Error updating partner slug:", err)
          result.error++
        }
      }
    } catch (err) {
      console.error("Error populating partner slugs:", err)
    } finally {
      setIsLoading((prev) => ({ ...prev, partners: false }))
      setResults((prev) => ({ ...prev, partners: result }))
    }
  }

  const populateAllSlugs = async () => {
    await Promise.all([
      populatePetsAdoptionSlugs(),
      populatePetsLostSlugs(),
      populatePetsFoundSlugs(),
      populateOngsSlugs(),
      populateEventsSlugs(),
      populatePartnersSlugs(),
    ])
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          onClick={populatePetsAdoptionSlugs}
          disabled={isLoading.pets}
          className="flex items-center justify-center"
        >
          {isLoading.pets ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para Pets (Adoção)"
          )}
        </Button>

        <Button
          onClick={populatePetsLostSlugs}
          disabled={isLoading.pets_lost}
          className="flex items-center justify-center"
        >
          {isLoading.pets_lost ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para Pets Perdidos"
          )}
        </Button>

        <Button
          onClick={populatePetsFoundSlugs}
          disabled={isLoading.pets_found}
          className="flex items-center justify-center"
        >
          {isLoading.pets_found ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para Pets Encontrados"
          )}
        </Button>

        <Button onClick={populateOngsSlugs} disabled={isLoading.ongs} className="flex items-center justify-center">
          {isLoading.ongs ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para ONGs"
          )}
        </Button>

        <Button onClick={populateEventsSlugs} disabled={isLoading.events} className="flex items-center justify-center">
          {isLoading.events ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para Eventos"
          )}
        </Button>

        <Button
          onClick={populatePartnersSlugs}
          disabled={isLoading.partners}
          className="flex items-center justify-center"
        >
          {isLoading.partners ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando slugs...
            </>
          ) : (
            "Gerar slugs para Parceiros"
          )}
        </Button>
      </div>

      <div className="mt-6">
        <Button onClick={populateAllSlugs} disabled={Object.values(isLoading).some(Boolean)} className="w-full">
          {Object.values(isLoading).some(Boolean) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando todos os slugs...
            </>
          ) : (
            "Gerar todos os slugs"
          )}
        </Button>
      </div>

      {/* Results display */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Resultados:</h3>
          <div className="space-y-2">
            {Object.entries(results).map(([table, result]) => (
              <div key={table} className="flex items-center justify-between">
                <span className="font-medium">{table}:</span>
                <div>
                  <span className="text-green-600 mr-4">{result.success} sucesso(s)</span>
                  {result.error > 0 && <span className="text-red-600">{result.error} erro(s)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
