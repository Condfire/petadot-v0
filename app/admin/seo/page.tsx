import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import AdminAuthCheck from "@/components/admin-auth-check"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SlugGeneratorClient from "./slug-generator-client"

export const metadata = {
  title: "Ferramentas de SEO - Administração | Petadot",
  description: "Ferramentas de SEO para administradores do Petadot",
}

export default async function AdminSeoPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Você precisa estar logado como administrador para acessar esta página.</p>
      </div>
    )
  }

  const { data: userRole } = await supabase.from("users").select("is_admin").eq("id", userId).single()

  if (!userRole?.is_admin) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Você precisa ser um administrador para acessar esta página.</p>
      </div>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Ferramentas de SEO</h1>

        <Tabs defaultValue="slugs">
          <TabsList className="mb-6">
            <TabsTrigger value="slugs">Gerenciar Slugs</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          </TabsList>

          <TabsContent value="slugs">
            <SlugGeneratorClient />
          </TabsContent>

          <TabsContent value="sitemap">
            <SitemapSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthCheck>
  )
}

function SitemapSection() {
  return (
    <div className="grid gap-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Sitemap</h3>
          <p className="text-sm text-muted-foreground">
            Gerenciar o sitemap do site para melhorar a indexação nos motores de busca
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Sitemap Principal</h3>
              <p className="text-sm text-muted-foreground mb-2">
                O sitemap principal contém links para todas as páginas do site.
              </p>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Ver Sitemap
              </a>
            </div>

            <div>
              <h3 className="text-lg font-medium">Sitemaps Específicos</h3>
              <p className="text-sm text-muted-foreground mb-2">Sitemaps específicos para cada tipo de conteúdo.</p>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                <a
                  href="/api/sitemap/pets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Pets para Adoção
                </a>
                <a
                  href="/api/sitemap/pets_lost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Pets Perdidos
                </a>
                <a
                  href="/api/sitemap/pets_found"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Pets Encontrados
                </a>
                <a
                  href="/api/sitemap/ongs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  ONGs
                </a>
                <a
                  href="/api/sitemap/events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Eventos
                </a>
                <a
                  href="/api/sitemap/partners"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Parceiros
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Regenerar Sitemap</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Force a regeneração do sitemap para incluir as alterações mais recentes.
              </p>
              <RegenerateSitemapButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// This is a server component, so we need to create a client component for the button
function RegenerateSitemapButton() {
  return (
    <form action="/api/admin/regenerate-sitemap" method="POST">
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
      >
        Regenerar Sitemap
      </button>
    </form>
  )
}
