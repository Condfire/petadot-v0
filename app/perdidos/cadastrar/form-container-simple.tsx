"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import SimpleStateCitySelector from "@/components/simple-state-city-selector"
import SimpleImageUpload from "@/components/simple-image-upload"

export default function SimpleFormContainer() {
  const [petName, setPetName] = useState("")
  const [species, setSpecies] = useState("dog")
  const [breed, setBreed] = useState("")
  const [lastSeenDate, setLastSeenDate] = useState(new Date().toISOString().split("T")[0])
  const [lastSeenLocation, setLastSeenLocation] = useState("")
  const [contact, setContact] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formValid, setFormValid] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Verificar se o formulário é válido
  useEffect(() => {
    const isValid =
      lastSeenDate !== "" && lastSeenLocation !== "" && contact !== "" && state !== "" && city !== "" && imageUrl !== ""

    setFormValid(isValid)
    console.log("Form valid:", isValid, "Image URL:", imageUrl)
  }, [lastSeenDate, lastSeenLocation, contact, state, city, imageUrl])

  // Função para gerar um slug básico
  const generateSlug = (name: string, city: string, state: string, id: string) => {
    const petType = "perdido"
    const cleanName = (name || "pet")
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
    const cleanCity = city
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
    const cleanState = state.toLowerCase()

    return `${cleanName}-${petType}-${cleanCity}-${cleanState}-${id.substring(0, 5)}`
  }

  const handleImageUpload = (url: string) => {
    console.log("Image uploaded:", url)
    setImageUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Você precisa estar logado para reportar um pet perdido.")
        router.push("/login")
        return
      }

      // Validar campos obrigatórios
      if (!imageUrl) {
        setError("Por favor, faça upload de uma imagem do pet.")
        setLoading(false)
        return
      }

      if (!state || !city) {
        setError("Por favor, selecione o estado e a cidade.")
        setLoading(false)
        return
      }

      console.log("Enviando dados do pet com imagem:", imageUrl)

      const petData = {
        name: petName,
        species,
        breed,
        gender: "male", // Valor padrão
        size: "medium", // Valor padrão
        color: "black", // Valor padrão
        last_seen_date: lastSeenDate,
        last_seen_location: lastSeenLocation,
        contact,
        state,
        city,
        image_url: imageUrl,
        user_id: user.id,
        status: "pending",
      }

      // Inserir o pet e obter o ID
      const { data: insertedPet, error: insertError } = await supabase.from("pets_lost").insert([petData]).select()

      if (insertError) throw insertError

      // Se o pet foi inserido com sucesso, gerar e atualizar o slug
      if (insertedPet && insertedPet.length > 0) {
        const pet = insertedPet[0]
        const slug = generateSlug(petName, city, state, pet.id)

        // Atualizar o registro com o slug
        const { error: updateError } = await supabase.from("pets_lost").update({ slug }).eq("id", pet.id)

        if (updateError) {
          console.error("Erro ao atualizar slug:", updateError)
        }
      }

      alert("Pet reportado com sucesso!")
      router.push("/dashboard/pets")
      router.refresh()
    } catch (err: any) {
      console.error("Erro ao salvar pet perdido:", err)
      setError(err.message || "Ocorreu um erro ao salvar o pet perdido.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="space-y-4">
        <div>
          <label htmlFor="petName" className="block text-sm font-medium text-gray-700">
            Nome do Pet (opcional)
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700">
            Espécie*
          </label>
          <select
            id="species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="bird">Pássaro</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
            Raça (opcional)
          </label>
          <input
            id="breed"
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lastSeenDate" className="block text-sm font-medium text-gray-700">
            Data em que foi visto pela última vez*
          </label>
          <input
            id="lastSeenDate"
            type="date"
            value={lastSeenDate}
            onChange={(e) => setLastSeenDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lastSeenLocation" className="block text-sm font-medium text-gray-700">
            Local onde foi visto pela última vez*
          </label>
          <input
            id="lastSeenLocation"
            type="text"
            value={lastSeenLocation}
            onChange={(e) => setLastSeenLocation(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <SimpleStateCitySelector onStateChange={setState} onCityChange={setCity} required />

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
            Contato para informações*
          </label>
          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Pet*</label>
          <SimpleImageUpload onImageUpload={handleImageUpload} required />
          {imageUrl && <p className="text-green-500 text-sm mt-1">Imagem carregada com sucesso!</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !formValid}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Reportar Pet Perdido"}
        </button>
      </div>

      {/* Debug info - remover em produção */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <p>Debug: Image URL: {imageUrl ? imageUrl.substring(0, 30) + "..." : "Nenhuma"}</p>
        <p>Form valid: {formValid ? "Sim" : "Não"}</p>
      </div>
    </form>
  )
}
