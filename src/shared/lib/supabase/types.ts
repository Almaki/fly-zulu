// Supabase Database Types - Auto-generated with custom tables
// Last updated: 2025-01-22 - Added news_comments and zulu_news tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nombre: string
          whatsapp: string
          categoria: 'FLIGHT' | 'GROUND'
          posicion: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO'
          role: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO' | 'SUPERADMIN'
          strikes: number
          is_banned: boolean
          subscription_tier: 'FREE' | 'PREMIUM'
          subscription_expires_at: string | null
          device_fingerprint: string | null
          last_ip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          whatsapp: string
          categoria: 'FLIGHT' | 'GROUND'
          posicion: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO'
          role?: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO' | 'SUPERADMIN'
          strikes?: number
          is_banned?: boolean
          subscription_tier?: 'FREE' | 'PREMIUM'
          subscription_expires_at?: string | null
          device_fingerprint?: string | null
          last_ip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          whatsapp?: string
          categoria?: 'FLIGHT' | 'GROUND'
          posicion?: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO'
          role?: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO' | 'SUPERADMIN'
          strikes?: number
          is_banned?: boolean
          subscription_tier?: 'FREE' | 'PREMIUM'
          subscription_expires_at?: string | null
          device_fingerprint?: string | null
          last_ip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      flights: {
        Row: {
          id: string
          flight_number: string
          airline: string
          origin: string
          destination: string
          std: string
          sta: string
          etd: string | null
          eta: string | null
          atd: string | null
          ata: string | null
          status: 'ON_TIME' | 'DELAY' | 'GATE_CHANGE' | 'CANCELED'
          gate: string | null
          aircraft_type: string | null
          aircraft_registration: string | null
          delay_minutes: number
          delay_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          flight_number: string
          airline: string
          origin: string
          destination: string
          std: string
          sta: string
          etd?: string | null
          eta?: string | null
          atd?: string | null
          ata?: string | null
          status?: 'ON_TIME' | 'DELAY' | 'GATE_CHANGE' | 'CANCELED'
          gate?: string | null
          aircraft_type?: string | null
          aircraft_registration?: string | null
          delay_minutes?: number
          delay_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          flight_number?: string
          airline?: string
          origin?: string
          destination?: string
          std?: string
          sta?: string
          etd?: string | null
          eta?: string | null
          atd?: string | null
          ata?: string | null
          status?: 'ON_TIME' | 'DELAY' | 'GATE_CHANGE' | 'CANCELED'
          gate?: string | null
          aircraft_type?: string | null
          aircraft_registration?: string | null
          delay_minutes?: number
          delay_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
      }
      pilot_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          tail: string
          aircraft_type: string
          dep: string
          dest: string
          out_time: string
          off_time: string
          on_time: string
          in_time: string
          flight_time_minutes: number
          block_time_minutes: number
          duty_start: string | null
          duty_end: string | null
          duty_time_minutes: number | null
          notes: string | null
          sync_status: 'synced' | 'pending' | 'syncing' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          tail: string
          aircraft_type: string
          dep: string
          dest: string
          out_time: string
          off_time: string
          on_time: string
          in_time: string
          flight_time_minutes?: number
          block_time_minutes?: number
          duty_start?: string | null
          duty_end?: string | null
          duty_time_minutes?: number | null
          notes?: string | null
          sync_status?: 'synced' | 'pending' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          tail?: string
          aircraft_type?: string
          dep?: string
          dest?: string
          out_time?: string
          off_time?: string
          on_time?: string
          in_time?: string
          flight_time_minutes?: number
          block_time_minutes?: number
          duty_start?: string | null
          duty_end?: string | null
          duty_time_minutes?: number | null
          notes?: string | null
          sync_status?: 'synced' | 'pending' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      fa_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          flight_number: string
          aircraft_type: string
          aircraft_registration: string
          origin: string
          destination: string
          captain: string | null
          copilot: string | null
          entry_time: string | null
          release_time: string | null
          boarding_time: string | null
          first_pax_time: string | null
          last_pax_time: string | null
          door_close_time: string | null
          bar_set_number: string | null
          fleje_color: string | null
          cash_folio: string | null
          sales_mxn: number
          sales_usd: number
          sales_card: number
          sync_status: 'synced' | 'pending' | 'syncing' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          flight_number: string
          aircraft_type: string
          aircraft_registration: string
          origin: string
          destination: string
          captain?: string | null
          copilot?: string | null
          entry_time?: string | null
          release_time?: string | null
          boarding_time?: string | null
          first_pax_time?: string | null
          last_pax_time?: string | null
          door_close_time?: string | null
          bar_set_number?: string | null
          fleje_color?: string | null
          cash_folio?: string | null
          sales_mxn?: number
          sales_usd?: number
          sales_card?: number
          sync_status?: 'synced' | 'pending' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          flight_number?: string
          aircraft_type?: string
          aircraft_registration?: string
          origin?: string
          destination?: string
          captain?: string | null
          copilot?: string | null
          entry_time?: string | null
          release_time?: string | null
          boarding_time?: string | null
          first_pax_time?: string | null
          last_pax_time?: string | null
          door_close_time?: string | null
          bar_set_number?: string | null
          fleje_color?: string | null
          cash_folio?: string | null
          sales_mxn?: number
          sales_usd?: number
          sales_card?: number
          sync_status?: 'synced' | 'pending' | 'syncing' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      directory_entries: {
        Row: {
          id: string
          airport_code: string
          category: string
          name: string
          description: string | null
          phone: string | null
          whatsapp: string | null
          address: string | null
          rating: number
          rating_count: number
          created_by: string
          updated_by: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          airport_code: string
          category: string
          name: string
          description?: string | null
          phone?: string | null
          whatsapp?: string | null
          address?: string | null
          rating?: number
          rating_count?: number
          created_by: string
          updated_by?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          airport_code?: string
          category?: string
          name?: string
          description?: string | null
          phone?: string | null
          whatsapp?: string | null
          address?: string | null
          rating?: number
          rating_count?: number
          created_by?: string
          updated_by?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          user_id: string
          flight_id: string | null
          type: string
          description: string
          actions_taken: string | null
          witnesses: string | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flight_id?: string | null
          type: string
          description: string
          actions_taken?: string | null
          witnesses?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flight_id?: string | null
          type?: string
          description?: string
          actions_taken?: string | null
          witnesses?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      news_comments: {
        Row: {
          id: string
          news_id: string
          news_title: string
          news_source: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          news_id: string
          news_title: string
          news_source: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          news_id?: string
          news_title?: string
          news_source?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      zulu_news: {
        Row: {
          id: string
          title: string
          description: string
          content: string | null
          image_url: string | null
          category: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
          is_breaking: boolean
          is_published: boolean
          author_id: string | null
          created_at: string
          updated_at: string
          published_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content?: string | null
          image_url?: string | null
          category?: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
          is_breaking?: boolean
          is_published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content?: string | null
          image_url?: string | null
          category?: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
          is_breaking?: boolean
          is_published?: boolean
          author_id?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string
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
      user_category: 'FLIGHT' | 'GROUND'
      user_position: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO'
      user_role: 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO' | 'SUPERADMIN'
      flight_status: 'ON_TIME' | 'DELAY' | 'GATE_CHANGE' | 'CANCELED'
      subscription_tier: 'FREE' | 'PREMIUM'
      sync_status: 'synced' | 'pending' | 'syncing' | 'error'
      zulu_news_category: 'aviacion' | 'operaciones' | 'seguridad' | 'anuncios' | 'general'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
