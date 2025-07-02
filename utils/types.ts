// Pet interface
export interface Pet {
  id: string
  name?: string
  main_image_url?: string
  species?: string
  species_other?: string
  breed?: string
  age?: string
  size?: string
  size_other?: string
  gender?: string
  gender_other?: string
  city?: string
  state?: string
  status?: string
  type?: "lost" | "found" | "adoption"
  slug?: string
  category?: string
  isSpecialNeeds?: boolean
  created_at?: string
  updated_at?: string
  description?: string
  contact_whatsapp?: string
  contact_email?: string
  contact_phone?: string
  user_id?: string
  ong_id?: string
  images?: string[]
  resolved?: boolean
  resolved_at?: string
  resolved_by?: string
  rejection_reason?: string
  moderation_status?: "pending" | "approved" | "rejected"
}

// User interface
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  city?: string
  state?: string
  created_at?: string
  updated_at?: string
  user_type?: "user" | "admin" | "ong"
}

// ONG interface
export interface ONG {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
  city?: string
  state?: string
  description?: string
  logo_url?: string
  website?: string
  instagram?: string
  facebook?: string
  cnpj?: string
  created_at?: string
  updated_at?: string
  slug?: string
}

// Event interface
export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  city?: string
  state?: string
  image_url?: string
  ong_id?: string
  created_at?: string
  updated_at?: string
  slug?: string
}

// Story interface
export interface Story {
  id: string
  title: string
  content: string
  image_url?: string
  pet_id?: string
  user_id?: string
  likes?: number
  created_at?: string
  updated_at?: string
  moderation_status?: "pending" | "approved" | "rejected"
}

// Partner interface
export interface Partner {
  id: string
  name: string
  description?: string
  logo_url?: string
  website?: string
  city?: string
  state?: string
  created_at?: string
  updated_at?: string
}

// Report interface
export interface Report {
  id: string
  pet_id: string
  reporter_email?: string
  reason: string
  description?: string
  status?: "pending" | "reviewed" | "resolved"
  created_at?: string
  updated_at?: string
}

// Filter interfaces
export interface PetFilters {
  species?: string
  size?: string
  gender?: string
  city?: string
  state?: string
  age?: string
  breed?: string
}

export interface SearchParams {
  page?: number
  limit?: number
  search?: string
  filters?: PetFilters
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form interfaces
export interface PetFormData {
  name: string
  species: string
  species_other?: string
  breed?: string
  age?: string
  size: string
  size_other?: string
  gender: string
  gender_other?: string
  city: string
  state: string
  description?: string
  contact_whatsapp?: string
  contact_email?: string
  contact_phone?: string
  images?: File[]
  isSpecialNeeds?: boolean
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

// Database table types
export type PetStatus = "active" | "resolved" | "expired"
export type ModerationStatus = "pending" | "approved" | "rejected"
export type UserType = "user" | "admin" | "ong"
export type PetType = "lost" | "found" | "adoption"
export type Species = "dog" | "cat" | "other"
export type Size = "small" | "medium" | "large" | "other"
export type Gender = "male" | "female" | "other"
