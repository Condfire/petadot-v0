/**
 * Gera dados estruturados para um pet de adoção
 * @param pet Dados do pet
 * @param options Opções adicionais
 * @returns Dados estruturados no formato JSON-LD
 */
export function generateAdoptionPetSchema(pet: any, options: { baseUrl?: string } = {}) {
  try {
    if (!pet) return {}

    const baseUrl = options.baseUrl || "https://www.petadot.com.br"
    const petUrl = `${baseUrl}/adocao/${pet.slug || pet.id}`
    const imageUrl = pet.image_url || `${baseUrl}/placeholder.svg?height=600&width=800&query=pet`

    // Obter informações da ONG, se disponível
    const ong = pet.ongs || {}
    const location = pet.location || (ong.city && ong.state ? `${ong.city}, ${ong.state}` : "")

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: pet.name || "Pet para adoção",
      description:
        pet.description || `${pet.name || "Pet"} disponível para adoção${location ? ` em ${location}` : ""}.`,
      image: imageUrl,
      url: petUrl,
      brand: {
        "@type": "Organization",
        name: ong.name || "PetAdot",
      },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "BRL",
        url: petUrl,
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Espécie",
          value: pet.species || "Não informado",
        },
        {
          "@type": "PropertyValue",
          name: "Raça",
          value: pet.breed || "Não informado",
        },
        {
          "@type": "PropertyValue",
          name: "Idade",
          value: pet.age || "Não informado",
        },
        {
          "@type": "PropertyValue",
          name: "Gênero",
          value: pet.gender || "Não informado",
        },
        {
          "@type": "PropertyValue",
          name: "Porte",
          value: pet.size || "Não informado",
        },
        {
          "@type": "PropertyValue",
          name: "Cor",
          value: pet.color || "Não informado",
        },
      ],
    }
  } catch (error) {
    console.error("Erro ao gerar dados estruturados para pet de adoção:", error)
    return {}
  }
}

/**
 * Gera dados estruturados para um pet perdido
 * @param pet Dados do pet
 * @param options Opções adicionais
 * @returns Dados estruturados no formato JSON-LD
 */
export function generateLostPetSchema(pet: any, options: { baseUrl?: string } = {}) {
  try {
    if (!pet) return {}

    const baseUrl = options.baseUrl || "https://www.petadot.com.br"
    const petUrl = `${baseUrl}/perdidos/${pet.slug || pet.id}`
    const imageUrl = pet.image_url || `${baseUrl}/placeholder.svg?height=600&width=800&query=pet+perdido`

    // Preparar a localização
    const location = pet.location || (pet.city && pet.state ? `${pet.city}, ${pet.state}` : "")

    return {
      "@context": "https://schema.org",
      "@type": "LostAndFound",
      name: `${pet.name || "Pet"} perdido`,
      description:
        pet.description || `${pet.name || "Pet"} perdido${location ? ` em ${location}` : ""}. Ajude a encontrá-lo.`,
      image: imageUrl,
      url: petUrl,
      datePosted: pet.created_at,
      lostLocation: {
        "@type": "Place",
        name: pet.last_seen_location || location || "Localização não informada",
      },
      foundLocation: null,
      itemLost: {
        "@type": "Thing",
        name: pet.name || "Pet perdido",
        description: `${pet.species || "Animal"} perdido`,
      },
      author: {
        "@type": "Person",
        name: pet.contact_name || "Não informado",
        telephone: pet.contact_phone || pet.contact || "Não informado",
        email: pet.contact_email || "Não informado",
      },
    }
  } catch (error) {
    console.error("Erro ao gerar dados estruturados para pet perdido:", error)
    return {}
  }
}

/**
 * Gera dados estruturados para um pet encontrado
 * @param pet Dados do pet
 * @param options Opções adicionais
 * @returns Dados estruturados no formato JSON-LD
 */
export function generateFoundPetSchema(pet: any, options: { baseUrl?: string } = {}) {
  try {
    if (!pet) return {}

    const baseUrl = options.baseUrl || "https://www.petadot.com.br"
    const petUrl = `${baseUrl}/encontrados/${pet.slug || pet.id}`
    const imageUrl = pet.image_url || `${baseUrl}/placeholder.svg?height=600&width=800&query=pet+encontrado`

    // Preparar a localização
    const location = pet.location || (pet.city && pet.state ? `${pet.city}, ${pet.state}` : "")

    return {
      "@context": "https://schema.org",
      "@type": "LostAndFound",
      name: `${pet.name || "Pet"} encontrado`,
      description:
        pet.description ||
        `${pet.name || "Pet"} encontrado${location ? ` em ${location}` : ""}. Ajude a encontrar seu dono.`,
      image: imageUrl,
      url: petUrl,
      datePosted: pet.created_at,
      lostLocation: null,
      foundLocation: {
        "@type": "Place",
        name: pet.found_location || location || "Localização não informada",
      },
      itemFound: {
        "@type": "Thing",
        name: pet.name || "Pet encontrado",
        description: `${pet.species || "Animal"} encontrado`,
      },
      author: {
        "@type": "Person",
        name: pet.contact_name || "Não informado",
        telephone: pet.contact_phone || pet.contact || "Não informado",
        email: pet.contact_email || "Não informado",
      },
    }
  } catch (error) {
    console.error("Erro ao gerar dados estruturados para pet encontrado:", error)
    return {}
  }
}

/**
 * Gera dados estruturados para um pet (genérico)
 * @param pet Dados do pet
 * @param type Tipo do pet (adoption, lost, found)
 * @param options Opções adicionais
 * @returns Dados estruturados no formato JSON-LD
 */
export function generatePetStructuredData(pet: any, type: "adoption" | "lost" | "found" = "adoption", options = {}) {
  switch (type) {
    case "adoption":
      return generateAdoptionPetSchema(pet, options)
    case "lost":
      return generateLostPetSchema(pet, options)
    case "found":
      return generateFoundPetSchema(pet, options)
    default:
      return generateAdoptionPetSchema(pet, options)
  }
}
