"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function createTestPets() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Verificar se já existem pets
    const { count: petsCount } = await supabase.from("pets").select("*", { count: "exact", head: true })

    const { count: lostPetsCount } = await supabase.from("pets_lost").select("*", { count: "exact", head: true })

    const { count: foundPetsCount } = await supabase.from("pets_found").select("*", { count: "exact", head: true })

    console.log("Contagem atual:", { petsCount, lostPetsCount, foundPetsCount })

    // Criar pets para adoção se não existirem
    if (!petsCount || petsCount < 3) {
      const petData = [
        {
          id: uuidv4(),
          name: "Rex",
          species: "dog",
          breed: "Labrador",
          age: "adult",
          size: "large",
          gender: "male",
          color: "golden",
          description: "Um cachorro amigável e brincalhão que adora crianças.",
          is_vaccinated: true,
          is_neutered: true,
          is_special_needs: false,
          image_url: "/golden-retriever-park.png",
          status: "approved",
          created_at: new Date().toISOString(),
          good_with_kids: true,
          good_with_cats: false,
          good_with_dogs: true,
          city: "São Paulo",
          state: "SP",
        },
        {
          id: uuidv4(),
          name: "Luna",
          species: "cat",
          breed: "Siamês",
          age: "young",
          size: "small",
          gender: "female",
          color: "white",
          description: "Uma gatinha dócil e carinhosa que adora dormir no colo.",
          is_vaccinated: true,
          is_neutered: true,
          is_special_needs: false,
          image_url: "/a-cute-pet.png",
          status: "approved",
          created_at: new Date().toISOString(),
          good_with_kids: true,
          good_with_cats: true,
          good_with_dogs: false,
          city: "Rio de Janeiro",
          state: "RJ",
        },
      ]

      const { error: petsError } = await supabase.from("pets").insert(petData)

      if (petsError) {
        console.error("Erro ao criar pets para adoção:", petsError)
      } else {
        console.log("Pets para adoção criados com sucesso")
      }
    }

    // Criar pets perdidos se não existirem
    if (!lostPetsCount || lostPetsCount < 3) {
      const lostPetData = [
        {
          id: uuidv4(),
          name: "Toby",
          species: "dog",
          breed: "Beagle",
          age: "adult",
          size: "medium",
          gender: "male",
          color: "brown",
          description: "Perdido no parque da cidade. Usa coleira vermelha.",
          last_seen_date: new Date().toISOString().split("T")[0],
          last_seen_location: "Parque Ibirapuera",
          contact: "contato@exemplo.com",
          image_url: "/golden-retriever-park.png",
          status: "approved",
          created_at: new Date().toISOString(),
          city: "São Paulo",
          state: "SP",
        },
        {
          id: uuidv4(),
          name: "Nina",
          species: "cat",
          breed: "Persa",
          age: "young",
          size: "small",
          gender: "female",
          color: "white",
          description: "Fugiu de casa durante uma tempestade. Muito assustada.",
          last_seen_date: new Date().toISOString().split("T")[0],
          last_seen_location: "Rua das Flores, 123",
          contact: "contato@exemplo.com",
          image_url: "/a-cute-pet.png",
          status: "approved",
          created_at: new Date().toISOString(),
          city: "Curitiba",
          state: "PR",
        },
      ]

      const { error: lostPetsError } = await supabase.from("pets_lost").insert(lostPetData)

      if (lostPetsError) {
        console.error("Erro ao criar pets perdidos:", lostPetsError)
      } else {
        console.log("Pets perdidos criados com sucesso")
      }
    }

    // Criar pets encontrados se não existirem
    if (!foundPetsCount || foundPetsCount < 3) {
      const foundPetData = [
        {
          id: uuidv4(),
          name: "Desconhecido",
          species: "dog",
          breed: "Vira-lata",
          age: "adult",
          size: "medium",
          gender: "male",
          color: "black",
          description: "Encontrado vagando perto do shopping. Sem coleira.",
          found_date: new Date().toISOString().split("T")[0],
          found_location: "Av. Paulista, próximo ao shopping",
          contact: "contato@exemplo.com",
          image_url: "/golden-retriever-park.png",
          status: "approved",
          created_at: new Date().toISOString(),
          city: "São Paulo",
          state: "SP",
        },
        {
          id: uuidv4(),
          name: "Sem nome",
          species: "cat",
          breed: "Vira-lata",
          age: "young",
          size: "small",
          gender: "female",
          color: "mixed",
          description: "Encontrada no quintal. Muito dócil e carinhosa.",
          found_date: new Date().toISOString().split("T")[0],
          found_location: "Rua das Acácias, 456",
          contact: "contato@exemplo.com",
          image_url: "/a-cute-pet.png",
          status: "approved",
          created_at: new Date().toISOString(),
          city: "Belo Horizonte",
          state: "MG",
        },
      ]

      const { error: foundPetsError } = await supabase.from("pets_found").insert(foundPetData)

      if (foundPetsError) {
        console.error("Erro ao criar pets encontrados:", foundPetsError)
      } else {
        console.log("Pets encontrados criados com sucesso")
      }
    }

    return { success: true, message: "Dados de teste criados com sucesso" }
  } catch (error) {
    console.error("Erro ao criar dados de teste:", error)
    return { success: false, message: "Erro ao criar dados de teste" }
  }
}
