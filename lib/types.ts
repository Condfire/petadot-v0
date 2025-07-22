export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          user_id: string
          name: string
          species: string
          breed: string
          color: string
          size: "small" | "medium" | "large"
          gender: "male" | "female" | "unknown"
          category: "lost" | "found" | "adoption"
          status: string
          description: string
          contact_whatsapp: string
          city: string
          state: string
          image_urls: string[]
          main_image_url: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          species: string
          breed: string
          color: string
          size: "small" | "medium" | "large"
          gender: "male" | "female" | "unknown"
          category: "lost" | "found" | "adoption"
          status: string
          description: string
          contact_whatsapp: string
          city: string
          state: string
          image_urls: string[]
          main_image_url?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          species?: string
          breed?: string
          color?: string
          size?: "small" | "medium" | "large"
          gender?: "male" | "female" | "unknown"
          category?: "lost" | "found" | "adoption"
          status?: string
          description?: string
          contact_whatsapp?: string
          city?: string
          state?: string
          image_urls?: string[]
          main_image_url?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
