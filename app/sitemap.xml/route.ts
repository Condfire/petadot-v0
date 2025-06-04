import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  // Create a direct Supabase client without cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://petadot.com.br"

  // Get counts for each category to determine if we need a sitemap index
  const counts: Record<string, number> = {}

  try {
    // Count pets for adoption
    const { count: adoptionCount, error: adoptionError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("category", "adoption")

    if (adoptionError) {
      console.error("Error getting count for adoption pets:", adoptionError)
      counts.pets = 0
    } else {
      counts.pets = adoptionCount || 0
    }

    // Count lost pets
    const { count: lostCount, error: lostError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("category", "lost")

    if (lostError) {
      console.error("Error getting count for lost pets:", lostError)
      counts.pets_lost = 0
    } else {
      counts.pets_lost = lostCount || 0
    }

    // Count found pets
    const { count: foundCount, error: foundError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("category", "found")

    if (foundError) {
      console.error("Error getting count for found pets:", foundError)
      counts.pets_found = 0
    } else {
      counts.pets_found = foundCount || 0
    }

    // Count ONGs (users with type = 'ong')
    const { count: ongsCount, error: ongsError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("type", "ong")

    if (ongsError) {
      console.error("Error getting count for ongs:", ongsError)
      counts.ongs = 0
    } else {
      counts.ongs = ongsCount || 0
    }

    // Count events
    const { count: eventsCount, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) {
      console.error("Error getting count for events:", eventsError)
      counts.events = 0
    } else {
      counts.events = eventsCount || 0
    }

    // Count partners
    const { count: partnersCount, error: partnersError } = await supabase
      .from("partners")
      .select("*", { count: "exact", head: true })

    if (partnersError) {
      console.error("Error getting count for partners:", partnersError)
      counts.partners = 0
    } else {
      counts.partners = partnersCount || 0
    }
  } catch (err) {
    console.error("Exception getting counts:", err)
    // Set all counts to 0 if there's an error
    counts.pets = 0
    counts.pets_lost = 0
    counts.pets_found = 0
    counts.ongs = 0
    counts.events = 0
    counts.partners = 0
  }

  // Calculate total count
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  // If total count is greater than 10,000, use sitemap index
  if (totalCount > 10000) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap/pets</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/pets_lost</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/pets_found</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/ongs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/events</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/partners</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/static</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  }

  // Otherwise, generate a single sitemap with all URLs
  const urls = []

  // Add static pages
  urls.push({
    loc: `${baseUrl}`,
    lastmod: new Date().toISOString(),
    priority: "1.0",
  })

  urls.push({
    loc: `${baseUrl}/adocao`,
    lastmod: new Date().toISOString(),
    priority: "0.9",
  })

  urls.push({
    loc: `${baseUrl}/perdidos`,
    lastmod: new Date().toISOString(),
    priority: "0.9",
  })

  urls.push({
    loc: `${baseUrl}/encontrados`,
    lastmod: new Date().toISOString(),
    priority: "0.9",
  })

  urls.push({
    loc: `${baseUrl}/ongs`,
    lastmod: new Date().toISOString(),
    priority: "0.9",
  })

  urls.push({
    loc: `${baseUrl}/eventos`,
    lastmod: new Date().toISOString(),
    priority: "0.9",
  })

  urls.push({
    loc: `${baseUrl}/parceiros`,
    lastmod: new Date().toISOString(),
    priority: "0.8",
  })

  urls.push({
    loc: `${baseUrl}/historias`,
    lastmod: new Date().toISOString(),
    priority: "0.8",
  })

  urls.push({
    loc: `${baseUrl}/sobre`,
    lastmod: new Date().toISOString(),
    priority: "0.7",
  })

  urls.push({
    loc: `${baseUrl}/contato`,
    lastmod: new Date().toISOString(),
    priority: "0.7",
  })

  // Add dynamic pages - using correct table structure
  try {
    // Add adoption pets
    const { data: adoptionPets, error: adoptionError } = await supabase
      .from("pets")
      .select("slug, updated_at")
      .eq("category", "adoption")
      .not("slug", "is", null)

    if (!adoptionError && adoptionPets && adoptionPets.length > 0) {
      for (const pet of adoptionPets) {
        if (pet.slug) {
          urls.push({
            loc: `${baseUrl}/adocao/${pet.slug}`,
            lastmod: pet.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }

    // Add lost pets
    const { data: lostPets, error: lostError } = await supabase
      .from("pets")
      .select("slug, updated_at")
      .eq("category", "lost")
      .not("slug", "is", null)

    if (!lostError && lostPets && lostPets.length > 0) {
      for (const pet of lostPets) {
        if (pet.slug) {
          urls.push({
            loc: `${baseUrl}/perdidos/${pet.slug}`,
            lastmod: pet.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }

    // Add found pets
    const { data: foundPets, error: foundError } = await supabase
      .from("pets")
      .select("slug, updated_at")
      .eq("category", "found")
      .not("slug", "is", null)

    if (!foundError && foundPets && foundPets.length > 0) {
      for (const pet of foundPets) {
        if (pet.slug) {
          urls.push({
            loc: `${baseUrl}/encontrados/${pet.slug}`,
            lastmod: pet.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }

    // Add ONGs (from users table)
    const { data: ongs, error: ongsError } = await supabase
      .from("users")
      .select("slug, updated_at")
      .eq("type", "ong")
      .not("slug", "is", null)

    if (!ongsError && ongs && ongs.length > 0) {
      for (const ong of ongs) {
        if (ong.slug) {
          urls.push({
            loc: `${baseUrl}/ongs/${ong.slug}`,
            lastmod: ong.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }

    // Add events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("slug, updated_at")
      .not("slug", "is", null)

    if (!eventsError && events && events.length > 0) {
      for (const event of events) {
        if (event.slug) {
          urls.push({
            loc: `${baseUrl}/eventos/${event.slug}`,
            lastmod: event.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }

    // Add partners
    const { data: partners, error: partnersError } = await supabase
      .from("partners")
      .select("slug, updated_at")
      .not("slug", "is", null)

    if (!partnersError && partners && partners.length > 0) {
      for (const partner of partners) {
        if (partner.slug) {
          urls.push({
            loc: `${baseUrl}/parceiros/${partner.slug}`,
            lastmod: partner.updated_at || new Date().toISOString(),
            priority: "0.8",
          })
        }
      }
    }
  } catch (err) {
    console.error("Exception fetching dynamic pages:", err)
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>
  `,
    )
    .join("")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 24 hours
    },
  })
}
