"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function BasicFormContainer() {
  const [petName, setPetName] = useState("")
  const [species, setSpecies] = useState("dog")
  const [breed, setBreed] = useState("")
  const [lastSeenDate, setLastSeenDate] = useState("")
  const [lastSeenLocation, setLastSeenLocation] = useState("")
  const [contact, setContact] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Estados brasileiros
  const estados = [
    { value: "", label: "Selecione um estado" },
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ]

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Formato de arquivo inválido. Apenas PNG, JPG e JPEG são aceitos.")
      return
    }

    // Validar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB em bytes
    if (file.size > maxSize) {
      setError("Arquivo muito grande. O tamanho máximo é 5MB.")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
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
      if (!imageFile) {
        setError("Por favor, faça upload de uma imagem do pet.")
        setLoading(false)
        return
      }

      if (!state || !city) {
        setError("Por favor, selecione o estado e a cidade.")
        setLoading(false)
        return
      }

      // Upload da imagem para o Supabase Storage
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `pets/${fileName}`

      const { error: uploadError } = await supabase.storage.from("pets").upload(filePath, imageFile)

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`)
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("pets").getPublicUrl(filePath)

      // Inserir dados do pet no banco
      const petData = {
        name: petName,
        species,
        breed,
        gender: "male", // Valor padrão
        size: "medium", // Valor padrão
        color: "black", // Valor padrão
        last_seen_date: lastSeenDate || new Date().toISOString().split("T")[0],
        last_seen_location: lastSeenLocation,
        contact,
        state,
        city,
        image_url: publicUrl,
        user_id: user.id,
        status: "pending",
      }

      // Inserir o pet e obter o ID
      const { data: insertedPet, error: insertError } = await supabase.from("pets_lost").insert([petData]).select()

      if (insertError) throw new Error(`Erro ao salvar pet: ${insertError.message}`)

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

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            Estado*
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Cidade*
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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

          {imagePreview ? (
            <div className="relative w-full max-w-[200px] aspect-square overflow-hidden rounded-md border border-gray-300">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Selecionar imagem
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="sr-only"
                onChange={handleFileChange}
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG ou JPEG (máx. 5MB)</p>
            </div>
          )}
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
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Reportar Pet Perdido"}
        </button>
      </div>
    </form>
  )
}
