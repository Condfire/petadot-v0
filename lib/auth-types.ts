// Tipos relacionados à autenticação
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
