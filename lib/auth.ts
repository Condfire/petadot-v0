// Re-exportar o hook useAuth do contexto
import { useAuth as useAuthFromProvider } from "@/app/auth-provider"

// Interface para o usuário autenticado
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  type?: "regular" | "ngo_admin" | "admin"
  state?: string
  city?: string
  is_admin?: boolean
}

// Interface para o contexto de autenticação
export interface AuthContextType {
  user: AuthUser | null
  session: any | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    userType?: string,
    state?: string,
    city?: string,
  ) => Promise<{ success: boolean; error?: string; userId?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

// Hook de autenticação
export const useAuth = useAuthFromProvider

// Objeto auth para compatibilidade
export const auth = {
  useAuth: useAuthFromProvider,
}

// Exportação padrão para compatibilidade
export default useAuthFromProvider
