export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: string
          name: string
          species: string
          breed: string
          color: string
          size: string
          gender: string
          description: string
          image_urls: string[] | null
          status: string
          category: string
          created_at: string
          updated_at: string
          user_id: string | null
          slug: string | null
          city: string | null
          state: string | null
          contact_phone: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          ong_id: string | null
          rejection_reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolution_details: string | null
          special_needs: boolean | null
        }
        Insert: {
          id?: string
          name: string
          species: string
          breed: string
          color: string
          size: string
          gender: string
          description: string
          image_urls?: string[] | null
          status?: string
          category: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          slug?: string | null
          city?: string | null
          state?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          ong_id?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_details?: string | null
          special_needs?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          species?: string
          breed?: string
          color?: string
          size?: string
          gender?: string
          description?: string
          image_urls?: string[] | null
          status?: string
          category?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          slug?: string | null
          city?: string | null
          state?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          ong_id?: string | null
          rejection_reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_details?: string | null
          special_needs?: boolean | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          type: string | null
          is_admin: boolean | null
          state: string | null
          city: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          type?: string | null
          is_admin?: boolean | null
          state?: string | null
          city?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          type?: string | null
          is_admin?: boolean | null
          state?: string | null
          city?: string | null
        }
      }
      // Adicione outras tabelas conforme necessário
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
