import type { User } from "@supabase/supabase-js"

// Define the structure for your database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          provider: string
          email_verified: boolean
          user_type: "regular" | "admin" | "ngo_admin" | null // Custom user type
          created_at: string
          updated_at: string
          contact_whatsapp: string | null
          city: string | null
          state: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          provider?: string
          email_verified?: boolean
          user_type?: "regular" | "admin" | "ngo_admin" | null
          created_at?: string
          updated_at?: string
          contact_whatsapp?: string | null
          city?: string | null
          state?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          provider?: string
          email_verified?: boolean
          user_type?: "regular" | "admin" | "ngo_admin" | null
          created_at?: string
          updated_at?: string
          contact_whatsapp?: string | null
          city?: string | null
          state?: string | null
        }
      }
      pets: {
        Row: {
          id: string
          created_at: string
          name: string
          species: string
          breed: string | null
          age: string | null
          size: string | null
          gender: string | null
          color: string | null
          description: string | null
          main_image_url: string | null
          image_urls: string[] | null
          status: "pending" | "approved" | "rejected" | "adopted" | "resolved" | "reunited" | "available" | "pendente"
          category: "adoption" | "lost" | "found"
          user_id: string | null
          ong_id: string | null
          city: string | null
          state: string | null
          contact_email: string | null
          contact_phone: string | null
          lost_date: string | null
          location_details: string | null
          slug: string | null
          special_needs: string | null
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          species: string
          breed?: string | null
          age?: string | null
          size?: string | null
          gender?: string | null
          color?: string | null
          description?: string | null
          main_image_url?: string | null
          image_urls?: string[] | null
          status?: "pending" | "approved" | "rejected" | "adopted" | "resolved" | "reunited" | "available" | "pendente"
          category: "adoption" | "lost" | "found"
          user_id?: string | null
          ong_id?: string | null
          city?: string | null
          state?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          lost_date?: string | null
          location_details?: string | null
          slug?: string | null
          special_needs?: string | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          species?: string
          breed?: string | null
          age?: string | null
          size?: string | null
          gender?: string | null
          color?: string | null
          description?: string | null
          main_image_url?: string | null
          image_urls?: string[] | null
          status?: "pending" | "approved" | "rejected" | "adopted" | "resolved" | "reunited" | "available" | "pendente"
          category?: "adoption" | "lost" | "found"
          user_id?: string | null
          ong_id?: string | null
          city?: string | null
          state?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          lost_date?: string | null
          location_details?: string | null
          slug?: string | null
          special_needs?: string | null
          rejection_reason?: string | null
        }
      }
      ongs: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          user_id: string | null // Foreign key to users table
          slug: string | null
          cnpj: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          user_id?: string | null
          slug?: string | null
          cnpj?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          user_id?: string | null
          slug?: string | null
          cnpj?: string | null
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          image_url: string | null
          start_date: string
          end_date: string | null
          location: string | null
          city: string | null
          state: string | null
          organizer_id: string | null // Foreign key to ongs table
          status: "pending" | "approved" | "rejected" | "pendente"
          slug: string | null
          user_id: string | null // User who created the event
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          image_url?: string | null
          start_date: string
          end_date?: string | null
          location?: string | null
          city?: string | null
          state?: string | null
          organizer_id?: string | null
          status?: "pending" | "approved" | "rejected" | "pendente"
          slug?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          image_url?: string | null
          start_date?: string
          end_date?: string | null
          location?: string | null
          city?: string | null
          state?: string | null
          organizer_id?: string | null
          status?: "pending" | "approved" | "rejected" | "pendente"
          slug?: string | null
          user_id?: string | null
        }
      }
      pet_stories: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          image_url: string | null
          user_id: string
          status: "pending" | "approved" | "rejected"
          likes: number
          pet_id: string | null // Optional: Link to a specific pet
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          image_url?: string | null
          user_id: string
          status?: "pending" | "approved" | "rejected"
          likes?: number
          pet_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          image_url?: string | null
          user_id?: string
          status?: "pending" | "approved" | "rejected"
          likes?: number
          pet_id?: string | null
        }
      }
      partners: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          user_id: string | null // User who created the partner entry
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          user_id?: string | null
        }
      }
      pet_reports: {
        Row: {
          id: string
          created_at: string
          pet_id: string
          reporter_user_id: string | null
          report_reason: string
          status: "pending" | "resolved" | "rejected"
          resolved_at: string | null
          resolved_by_user_id: string | null
          contact_email: string | null
          contact_phone: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          pet_id: string
          reporter_user_id?: string | null
          report_reason: string
          status?: "pending" | "resolved" | "rejected"
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          pet_id?: string
          reporter_user_id?: string | null
          report_reason?: string
          status?: "pending" | "resolved" | "rejected"
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
        }
      }
      moderation_keywords: {
        Row: {
          id: string
          keyword: string
          created_at: string
        }
        Insert: {
          id?: string
          keyword: string
          created_at?: string
        }
        Update: {
          id?: string
          keyword?: string
          created_at?: string
        }
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Extend Supabase's User type with your custom profile fields
export interface UserProfile extends User {
  user_type?: "regular" | "admin" | "ngo_admin" | null
  name?: string | null
  avatar_url?: string | null
  contact_whatsapp?: string | null
  city?: string | null
  state?: string | null
}

// Define types for your data - replace 'any' with actual types
export type Pet = Database["public"]["Tables"]["pets"]["Row"] & {
  ongs?: { id: string; name: string; logo_url: string | null; city: string | null } | null
}
export type Event = Database["public"]["Tables"]["events"]["Row"]
export type Ong = Database["public"]["Tables"]["ongs"]["Row"] & {
  user?: { contact_whatsapp: string | null; email: string | null } | null
}
export type Partner = Database["public"]["Tables"]["partners"]["Row"]
export type PetStory = Database["public"]["Tables"]["pet_stories"]["Row"]
export type PetReport = Database["public"]["Tables"]["pet_reports"]["Row"]

export type UserStats = {
  adoptionCount: number
  lostCount: number
  foundCount: number
  totalCount: number
  recentPets: Array<{
    id: string
    name: string
    main_image_url: string | null
    created_at: string
    status: string
    category: string
  }>
}

// Interface para paginação
export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
