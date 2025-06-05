import { useAuth as useAuthContext } from "@/app/auth-provider"

// Re-exportar o hook useAuth do contexto
export const useAuth = useAuthContext

// Criar um objeto auth para compatibilidade
export const auth = {
  useAuth: useAuthContext,
}

// Exportações adicionais para compatibilidade
export { useAuth as default } from "@/app/auth-provider"
