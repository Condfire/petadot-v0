export interface Evento {
  id: string
  name: string
  start_date: string
  end_date?: string | null
  location?: string | null
  event_type?: string | null
  [key: string]: any
}
