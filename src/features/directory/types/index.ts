import { z } from 'zod'
import { DIRECTORY_CATEGORIES } from '@/shared/constants'

export interface DirectoryEntry {
  id: string
  airport_code: string
  category: string
  name: string
  description: string | null
  phone: string
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

export const directoryEntrySchema = z.object({
  airport_code: z.string().length(3, 'Código IATA de 3 letras'),
  category: z.string().min(1, 'Categoría requerida'),
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  phone: z.string().min(10, 'Teléfono requerido'),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
})

export type DirectoryEntryFormData = z.infer<typeof directoryEntrySchema>

export interface DirectoryFilters {
  airport?: string
  category?: string
  search?: string
}

export type CategoryId = typeof DIRECTORY_CATEGORIES[number]['id']
