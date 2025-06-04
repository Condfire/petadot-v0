import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Maximum URLs per sitemap (before we need to use sitemap index)
const MAX_URLS_PER_SITEMAP = 10000

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client without cookies to avoid dynamic server usage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Get the base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.headers.get("host")}`

    // Get slugs from all relevant tables using our actual schema
    const [
      { data: adoptionPets, error: adoptionError },
      { data: lostPets, error: lostError },
      { data: foundPets, error: foundError },
      { data: ongs, error: ongsError },
      { data: events, error: eventsError },
      { data: partners, error: partnersError },
    ] = await Promise.all([
      // Pets for adoption
      supabase
        .from("pets")
        .select("slug, updated_at, created_at")
        .eq("category", "adoption")
        .not("slug", "is", null),
      // Lost pets
      supabase
        .from("pets")
        .select("slug, updated_at, created_at")
        .eq("category", "lost")
        .not("slug", "is", null),
      // Found pets
      supabase
        .from("pets")
        .select("slug, updated_at, created_at")
        .eq("category", "found")
        .not("slug", "is", null),
      // ONGs (from users table)
      supabase
        .from("users")
        .select("slug, updated_at, created_at")
        .eq("type", "ong")
        .not("slug", "is", null),
      // Events
      supabase
        .from("events")
        .select("slug, updated_at, created_at")
        .not("slug", "is", null),
      // Partners
      supabase
        .from("partners")
        .select("slug, updated_at, created_at")
        .not("slug", "is", null),
    ])

    if (adoptionError || lostError || foundError || ongsError || eventsError || partnersError) {
      console.error("Error fetching slugs for sitemap:", {
        adoptionError,
        lostError,
        foundError,
        ongsError,
        eventsError,
        partnersError,
      })
      return NextResponse.json({ error: "Error generating sitemap" }, { status: 500 })
    }

    // Count total URLs
    const totalUrls = [
      adoptionPets?.length || 0,
      lostPets?.length || 0,
      foundPets?.length || 0,
      ongs?.length || 0,
      events?.length || 0,
      partners?.length || 0,
    ].reduce((a, b) => a + b, 0)

    // Generate a single sitemap (simplified for now)
    return generateSitemap(baseUrl, [
      ...(adoptionPets || []).map((item) => ({
        url: `${baseUrl}/adocao/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
      ...(lostPets || []).map((item) => ({
        url: `${baseUrl}/perdidos/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
      ...(foundPets || []).map((item) => ({
        url: `${baseUrl}/encontrados/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
      ...(ongs || []).map((item) => ({
        url: `${baseUrl}/ongs/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
      ...(events || []).map((item) => ({
        url: `${baseUrl}/eventos/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
      ...(partners || []).map((item) => ({
        url: `${baseUrl}/parceiros/${item.slug}`,
        lastmod: item.updated_at || item.created_at,
      })),
    ])
  } catch (error) {
    console.error("Sitemap generation error:", error)
    return NextResponse.json({ error: "Error generating sitemap" }, { status: 500 })
  }
}

// Helper function to generate a sitemap
function generateSitemap(baseUrl: string, urls: Array<{ url: string; lastmod: string }>) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/adocao</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/perdidos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/encontrados</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ongs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/eventos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/parceiros</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${urls
    .map(
      (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date(item.lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join("")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
