export interface Evento {
  id: string
  name: string
  description?: string | null
  slug?: string | null
  start_date: string
  end_date?: string | null
  location?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  image_url?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  event_type?: string | null
  registration_url?: string | null
  registration_required?: boolean | null
  max_participants?: number | null
  is_featured?: boolean | null
  latitude?: number | null
  longitude?: number | null
  ong_id?: string | null
  user_id?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: any
}
