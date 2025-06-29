"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { withRetry, isRateLimitError } from "@/lib/api-helpers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MenuIcon, PawPrintIcon } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const { theme, setTheme } = useTheme()
  const { user, signOut, loading } = useAuth()
  const supabase = createClientComponentClient()

  // Construir a URL do logo do bucket do Supabase
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sppetadot/logo/logo.png`

  // Vamos melhorar a verificação de autenticação no Navbar

  // Substitua o useEffect de verificação de autenticação pelo seguinte:
  useEffect(() => {
    // Função para verificar autenticação
    const checkAuth = async () => {
      try {
        console.log("Navbar: Verificando autenticação...")

        // Obter sessão com retry
        const {
          data: { session },
          error: sessionError,
        } = await withRetry(() => supabase.auth.getSession(), {
          onRetry: (attempt, error, delay) => {
            console.warn(
              `Navbar: Erro de limitação de taxa ao verificar sessão. Tentando novamente em ${delay}ms (tentativa ${attempt})`,
              error,
            )
          },
        })

        if (sessionError) {
          console.error("Navbar: Erro ao verificar sessão:", sessionError)
          setIsAuthenticated(false)
          setUserEmail("")
          setIsAdmin(false)
          return
        }

        if (session) {
          console.log("Navbar: Usuário autenticado:", session.user.id)
          setIsAuthenticated(true)
          setUserEmail(session.user.email || "")

          // Verificar se o usuário é admin
          try {
            // Verificar status de admin com retry
            const { data, error } = await withRetry(
              () => supabase.from("users").select("is_admin").eq("id", session.user.id).maybeSingle(),
              {
                onRetry: (attempt, error, delay) => {
                  console.warn(
                    `Navbar: Erro de limitação de taxa ao verificar status de admin. Tentando novamente em ${delay}ms (tentativa ${attempt})`,
                    error,
                  )
                },
              },
            )

            if (error) {
              // Verificar se é um erro de limitação de taxa
              if (isRateLimitError(error)) {
                console.warn(
                  "Navbar: Erro de limitação de taxa ao verificar status de admin. Tentaremos novamente mais tarde.",
                )
              } else {
                console.error("Navbar: Erro ao verificar status de admin:", error.message)
              }
            } else if (data) {
              // Log do valor bruto e seu tipo
              console.log("Navbar: Status de admin (raw):", data.is_admin, typeof data.is_admin)

              // Converter para boolean explicitamente e registrar
              const isAdminBool = data.is_admin === true || data.is_admin === "true" || data.is_admin === 1
              console.log("Navbar: Status de admin (converted):", isAdminBool)

              setIsAdmin(isAdminBool)
            }
          } catch (error) {
            // Tratar erros de forma mais robusta
            if (isRateLimitError(error)) {
              console.warn(
                "Navbar: Erro de limitação de taxa ao verificar status de admin. Tentaremos novamente mais tarde.",
                error,
              )
            } else {
              console.error("Navbar: Erro ao verificar status de admin:", error)
            }
          }
        } else {
          console.log("Navbar: Usuário não autenticado")
          setIsAuthenticated(false)
          setUserEmail("")
          setIsAdmin(false)
        }
      } catch (error) {
        // Tratar erros de forma mais robusta
        if (isRateLimitError(error)) {
          console.warn(
            "Navbar: Erro de limitação de taxa ao verificar autenticação. Tentaremos novamente mais tarde.",
            error,
          )
        } else {
          console.error("Navbar: Erro ao verificar autenticação:", error)
        }

        setIsAuthenticated(false)
        setUserEmail("")
        setIsAdmin(false)
      }
    }

    // Verificar autenticação inicialmente
    checkAuth()

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Navbar: Evento de autenticação:", event)

      if (event === "SIGNED_OUT") {
        console.log("Navbar: Usuário desconectado")
        setIsAuthenticated(false)
        setUserEmail("")
        setIsAdmin(false)
        return
      }

      if (session) {
        console.log("Navbar: Usuário autenticado (listener):", session.user.id)
        setIsAuthenticated(true)
        setUserEmail(session.user.email || "")

        // Verificar se o usuário é admin
        try {
          // Verificar status de admin com retry
          const { data, error } = await withRetry(
            () => supabase.from("users").select("is_admin").eq("id", session.user.id).maybeSingle(),
            {
              onRetry: (attempt, error, delay) => {
                console.warn(
                  `Navbar: Erro de limitação de taxa ao verificar status de admin (listener). Tentando novamente em ${delay}ms (tentativa ${attempt})`,
                  error,
                )
              },
            },
          )

          if (error) {
            // Verificar se é um erro de limitação de taxa
            if (isRateLimitError(error)) {
              console.warn(
                "Navbar: Erro de limitação de taxa ao verificar status de admin (listener). Tentaremos novamente mais tarde.",
              )
            } else {
              console.error("Navbar: Erro ao verificar status de admin (listener):", error.message)
            }
          } else if (data) {
            // Log do valor bruto e seu tipo
            console.log("Navbar: Status de admin (listener raw):", data.is_admin, typeof data.is_admin)

            // Converter para boolean explicitamente e registrar
            const isAdminBool = data.is_admin === true || data.is_admin === "true" || data.is_admin === 1
            console.log("Navbar: Status de admin (listener converted):", isAdminBool)

            setIsAdmin(isAdminBool)
          }
        } catch (error) {
          // Tratar erros de forma mais robusta
          if (isRateLimitError(error)) {
            console.warn(
              "Navbar: Erro de limitação de taxa ao verificar status de admin (listener). Tentaremos novamente mais tarde.",
              error,
            )
          } else {
            console.error("Navbar: Erro ao verificar status de admin (listener):", error)
          }
        }
      } else if (event !== "TOKEN_REFRESHED") {
        console.log("Navbar: Usuário não autenticado (listener)")
        setIsAuthenticated(false)
        setUserEmail("")
        setIsAdmin(false)
      }
    })

    // Verificar autenticação quando a visibilidade da página muda
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Navbar: Página visível, verificando autenticação...")
        checkAuth()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [supabase])

  // Usar o estado local em vez de depender apenas do contexto useAuth
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true)
      setUserEmail(user.email || "")

      // Verificar se o usuário é admin quando o contexto de autenticação muda
      const checkAdminStatus = async () => {
        try {
          // Verificar status de admin com retry
          const { data, error } = await withRetry(
            () => supabase.from("users").select("is_admin").eq("id", user.id).single(),
            {
              onRetry: (attempt, error, delay) => {
                console.warn(
                  `Navbar: Erro de limitação de taxa ao verificar status de admin (useAuth). Tentando novamente em ${delay}ms (tentativa ${attempt})`,
                  error,
                )
              },
            },
          )

          if (!error && data) {
            console.log("Navbar: Status de admin (useAuth raw):", data.is_admin, typeof data.is_admin)

            // Convert to boolean explicitly and log
            const isAdminBool = data.is_admin === true || data.is_admin === "true" || data.is_admin === 1
            console.log("Navbar: Status de admin (useAuth converted):", isAdminBool)

            setIsAdmin(isAdminBool)
          }
        } catch (error) {
          // Tratar erros de forma mais robusta
          if (isRateLimitError(error)) {
            console.warn(
              "Navbar: Erro de limitação de taxa ao verificar status de admin (useAuth). Tentaremos novamente mais tarde.",
              error,
            )
          } else {
            console.error("Navbar: Erro ao verificar status de admin:", error)
          }
        }
      }

      checkAdminStatus()
    }
  }, [user, supabase])

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
      setIsAdmin(false)
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
      setIsAdmin(false)
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
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} alt={user.name || "User"} />
                    <AvatarFallback>{user.name ? user.name[0] : user.email[0]}</AvatarFallback>
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
                {user.type === "admin" && (
                  <DropdownMenuItem>
                    <Link href="/admin/dashboard" className="w-full">
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.type === "ngo_admin" && (
                  <DropdownMenuItem>
                    <Link href="/ongs/dashboard" className="w-full">
                      Painel ONG
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
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
