"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MenuIcon, PawPrintIcon } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const { theme, setTheme } = useTheme()
  const { user, signOut, loading, isInitialized } = useAuth() // Get isInitialized from useAuth

  // Construir a URL do logo do bucket do Supabase
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/logo.png`

  // Simplify auth check to rely on useAuth context
  useEffect(() => {
    if (isInitialized) {
      // Ensure auth context has finished its initial load
      setIsAuthenticated(!!user)
      setUserEmail(user?.email || "")
    }
  }, [user, isInitialized]) // Depend on user and isInitialized from useAuth

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Função de logout com tratamento de erro melhorado
  const handleSignOut = async () => {
    try {
      console.log("Navbar: Iniciando logout...")

      // Atualizar estado local imediatamente para feedback visual
      setIsAuthenticated(false)
      setUserEmail("")
      setIsMenuOpen(false)

      // Limpar cookies e localStorage relacionados à autenticação
      if (typeof window !== "undefined") {
        console.log("Navbar: Limpando armazenamento local...")

        // Limpar cookies relacionados ao Supabase
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.trim().split("=")
          if (name.includes("supabase") || name.includes("sb-")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        })

        // Limpar localStorage relacionado ao Supabase
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key)
          }
        })

        // Limpar sessionStorage relacionado ao Supabase
        Object.keys(sessionStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            sessionStorage.removeItem(key)
          }
        })
      }

      // Chamar signOut do contexto de autenticação
      await signOut()

      console.log("Navbar: Logout concluído, redirecionando...")

      // Forçar recarregamento da página para limpar qualquer estado em cache
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Navbar: Erro durante logout:", error)

      // Mesmo com erro, atualizar estado local
      setIsAuthenticated(false)
      setUserEmail("")
      setIsMenuOpen(false)

      // Forçar redirecionamento para a página inicial
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <PawPrintIcon className="h-6 w-6" />
          <span className="sr-only">PetAdot</span>
          <span className="hidden md:inline">PetAdot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
          <Link href="/adocao" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Adoção
          </Link>
          <Link href="/perdidos" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Perdidos
          </Link>
          <Link href="/encontrados" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Encontrados
          </Link>
          <Link href="/historias" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Histórias de Sucesso
          </Link>
          <Link href="/ongs" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            ONGs
          </Link>
          <Link href="/eventos" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Eventos
          </Link>
          <Link href="/sobre" className="font-medium hover:underline underline-offset-4" prefetch={false}>
            Sobre
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading || !isInitialized ? ( // Show loading until auth context is initialized
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} alt={user.name || "User"} />
                    <AvatarFallback>{user.name ? user.name[0] : user.email ? user.email[0] : "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">
                    Meu Painel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/profile" className="w-full">
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {user.user_type === "admin" && ( // Use user.user_type
                  <DropdownMenuItem>
                    <Link href="/admin/dashboard" className="w-full">
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.user_type === "ngo_admin" && ( // Use user.user_type
                  <DropdownMenuItem>
                    <Link href="/ongs/dashboard" className="w-full">
                      Painel ONG
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem> {/* Call handleSignOut */}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login" prefetch={false}>
                Login
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/adocao" className="w-full" prefetch={false}>
                  Adoção
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/perdidos" className="w-full" prefetch={false}>
                  Perdidos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/encontrados" className="w-full" prefetch={false}>
                  Encontrados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/historias" className="w-full" prefetch={false}>
                  Histórias de Sucesso
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/ongs" className="w-full" prefetch={false}>
                  ONGs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/eventos" className="w-full" prefetch={false}>
                  Eventos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/sobre" className="w-full" prefetch={false}>
                  Sobre
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
