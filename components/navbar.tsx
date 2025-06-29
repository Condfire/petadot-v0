"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  PawPrint,
  Search,
  Heart,
  Calendar,
  Users,
  Info,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Shield,
  Handshake,
  BookOpen,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { withRetry, isRateLimitError } from "@/lib/api-helpers"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
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
      className={`sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/60"
          : "bg-background/80 supports-[backdrop-filter]:bg-background/40"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 overflow-hidden">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt="PetAdot Logo"
              width={40}
              height={40}
              className="transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            PetAdot
          </span>
        </Link>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <button className="p-2" onClick={toggleMenu} aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/perdidos"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Search size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Perdidos
            </span>
          </Link>
          <Link
            href="/encontrados"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <PawPrint size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Encontrados
            </span>
          </Link>
          <Link
            href="/adocao"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Heart size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Adoção
            </span>
          </Link>
          <Link
            href="/eventos"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Eventos
            </span>
          </Link>
          <Link
            href="/ongs"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              ONGs
            </span>
          </Link>
          <Link
            href="/parceiros"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Handshake size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Parceiros
            </span>
          </Link>
          <Link
            href="/sobre"
            className="group px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info size={16} className="text-primary group-hover:text-primary/80 transition-colors" />
              Sobre
            </span>
          </Link>
          <div className="ml-2 border-l border-border h-6"></div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema" className="ml-2">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                  <User size={16} />
                  {userEmail ? userEmail.split("@")[0] : "Minha Conta"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-pets">Meus Pets</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/historias">Minhas Histórias</Link>
                </DropdownMenuItem>

                {/* Verificação explícita para administrador */}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield size={16} className="mr-2 text-primary" />
                        Administração
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut size={16} className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="ml-2">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn size={16} />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-background border-b border-border/40 py-4 animate-fade-in">
          <nav className="container flex flex-col gap-4">
            <Link
              href="/perdidos"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={18} />
              Perdidos
            </Link>
            <Link
              href="/encontrados"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <PawPrint size={18} />
              Encontrados
            </Link>
            <Link
              href="/adocao"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart size={18} />
              Adoção
            </Link>
            <Link
              href="/eventos"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar size={18} />
              Eventos
            </Link>
            <Link
              href="/ongs"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={18} />
              ONGs
            </Link>
            <Link
              href="/parceiros"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Handshake size={18} />
              Parceiros
            </Link>
            <Link
              href="/sobre"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Info size={18} />
              Sobre
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/historias"
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen size={18} />
                  Minhas Histórias
                </Link>

                {/* Verificação explícita para administrador */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield size={18} />
                    Administração
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors p-2 rounded-md hover:bg-muted"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn size={18} />
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
