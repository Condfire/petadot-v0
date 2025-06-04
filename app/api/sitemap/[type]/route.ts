import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const type = params.type
  const supabase = createRouteHandlerClient({ cookies })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://petadot.com.br"

  // Handle static pages sitemap
  if (type === "static") {
    const staticPages = [
      { url: "/", priority: "1.0" },
      { url: "/adocao", priority: "0.9" },
      { url: "/perdidos", priority: "0.9" },
      { url: "/encontrados", priority: "0.9" },
      { url: "/ongs", priority: "0.9" },
      { url: "/eventos", priority: "0.9" },
      { url: "/parceiros", priority: "0.8" },
      { url: "/historias", priority: "0.8" },
      { url: "/sobre", priority: "0.7" },
      { url: "/contato", priority: "0.7" },
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>${page.priority}</priority>
  </url>
  `,
    )
    .join("")}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  }

  // Map type to table and path
  const tableMap: Record<string, { table: string; path: string }> = {
    pets: { table: "pets", path: "adocao" },
    pets_lost: { table: "pets_lost", path: "perdidos" },
    pets_found: { table: "pets_found", path: "encontrados" },
    ongs: { table: "ongs", path: "ongs" },
    events: { table: "events", path: "eventos" },
    partners: { table: "partners", path: "parceiros" },
  }

  const tableInfo = tableMap[type]

  if (!tableInfo) {
    return NextResponse.json({ error: "Invalid sitemap type" }, { status: 400 })
  }

  // Get records with slugs
  const { data, error } = await supabase.from(tableInfo.table).select("slug, updated_at").not("slug", "is", null)

  if (error) {
    console.error(`Error fetching ${tableInfo.table}:`, error)
    return NextResponse.json({ error: `Error fetching data: ${error.message}` }, { status: 500 })
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${data
    .map(
      (item) => `
  <url>
    <loc>${baseUrl}/${tableInfo.path}/${item.slug}</loc>
    <lastmod>${item.updated_at || new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  `,
    )
    .join("")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
