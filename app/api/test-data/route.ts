import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Verificar se já existem dados
    const { data: existingPets, error: checkError } = await supabase.from("pets").select("id").limit(1)

    if (checkError) {
      console.error("Erro ao verificar pets existentes:", checkError)
      return NextResponse.json({ error: "Erro ao verificar pets existentes" }, { status: 500 })
    }

    // Se já existirem pets, não criar novos
    if (existingPets && existingPets.length > 0) {
      return NextResponse.json({ message: "Já existem pets no banco de dados" })
    }

    // Criar um pet para adoção
    const { data: adoptionPet, error: adoptionError } = await supabase.from("pets").insert([
      {
        name: "Rex",
        species: "dog",
        breed: "Labrador",
        age: "adult",
        size: "large",
        gender: "male",
        color: "golden",
        description: "Um labrador amigável e brincalhão que adora crianças.",
        image_url: "/happy-golden-retriever.png",
        status: "aprovado", // Usando o mesmo status que apareceu no SQL
        city: "São Paulo",
        state: "SP",
      },
    ])

    if (adoptionError) {
      console.error("Erro ao criar pet para adoção:", adoptionError)
      return NextResponse.json({ error: "Erro ao criar pet para adoção" }, { status: 500 })
    }

    // Criar um pet perdido
    const { data: lostPet, error: lostError } = await supabase.from("pets_lost").insert([
      {
        name: "Luna",
        species: "cat",
        breed: "Siamês",
        age: "young",
        size: "small",
        gender: "female",
        color: "white",
        description: "Gata siamesa com olhos azuis, desapareceu no bairro Jardins.",
        last_seen_date: new Date().toISOString(),
        last_seen_location: "Rua Augusta, São Paulo",
        contact: "contato@exemplo.com",
        image_url: "/tabby-cat-sunbeam.png",
        status: "aprovado", // Usando o mesmo status que apareceu no SQL
        city: "São Paulo",
        state: "SP",
      },
    ])

    if (lostError) {
      console.error("Erro ao criar pet perdido:", lostError)
      return NextResponse.json({ error: "Erro ao criar pet perdido" }, { status: 500 })
    }

    // Criar um pet encontrado
    const { data: foundPet, error: foundError } = await supabase.from("pets_found").insert([
      {
        name: "Desconhecido",
        species: "dog",
        breed: "Vira-lata",
        age: "adult",
        size: "medium",
        gender: "male",
        color: "brown",
        description: "Cachorro encontrado na praça, sem coleira, aparentemente perdido.",
        found_date: new Date().toISOString(),
        found_location: "Praça da Liberdade, Belo Horizonte",
        contact: "contato@exemplo.com",
        image_url: "/placeholder.svg?key=uo9iy",
        status: "aprovado", // Usando o mesmo status que apareceu no SQL
        city: "Belo Horizonte",
        state: "MG",
      },
    ])

    if (foundError) {
      console.error("Erro ao criar pet encontrado:", foundError)
      return NextResponse.json({ error: "Erro ao criar pet encontrado" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Dados de teste criados com sucesso",
      adoptionPet,
      lostPet,
      foundPet,
    })
  } catch (error) {
    console.error("Erro ao criar dados de teste:", error)
    return NextResponse.json({ error: "Erro ao criar dados de teste" }, { status: 500 })
  }
}
