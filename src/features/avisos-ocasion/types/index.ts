export type CiudadCode = 'TIJ' | 'BJX' | 'GDL' | 'MTY' | 'MEX' | 'CUN'

// Categorías separadas: compra y venta son independientes
export type AvisoCategoria =
  | 'compra'           // Busco comprar algo
  | 'venta'            // Vendo algo
  | 'renta_inmueble'   // Rento departamento/casa
  | 'venta_inmueble'   // Vendo departamento/casa
  | 'renta_auto'       // Rento auto
  | 'roomie'           // Busco/ofrezco roomie
  | 'servicios'        // Ofrezco servicios
  | 'medico'           // Servicios médicos
  | 'taxi_seguro'      // Taxi seguro para tripulaciones
  | 'otro'

// Servicios incluidos para roomie/renta
export type ServicioIncluido = 'internet' | 'agua' | 'luz' | 'mantenimiento' | 'gas' | 'otro'

// Tipo de inmueble
export type TipoInmueble = 'casa' | 'departamento'

// Tipo de auto para taxi
export type TipoAutoTaxi = 'compacto' | 'camioneta'

export interface Aviso {
  id: string
  ciudad_code: CiudadCode
  categoria: AvisoCategoria
  titulo: string
  descripcion: string
  precio: number | null
  moneda: 'MXN' | 'USD'
  whatsapp: string | null
  telefono: string | null
  imagenes: string[]
  created_by: string
  created_at: string
  updated_at: string
  activo: boolean
  expires_at: string

  // Campos para inmuebles y roomie
  direccion: string | null
  direccion_lat: number | null
  direccion_lng: number | null
  fecha_disponibilidad: string | null

  // Campos para inmuebles
  tipo_inmueble: TipoInmueble | null
  tiene_cochera: boolean | null

  // Campos para roomie e inmuebles
  acepta_mascotas: boolean | null
  servicios_incluidos: ServicioIncluido[]
  precio_todo_incluido: boolean

  // Campo general (excepto inmuebles)
  servicio_domicilio: boolean

  // Campos para taxi seguro
  nombre_conductor: string | null
  tipo_auto_taxi: TipoAutoTaxi | null

  // Página web / link
  pagina_web: string | null

  // Solicitud de aviso permanente
  solicita_permanente: boolean

  // Joined data - información del responsable de la publicación
  created_by_user?: {
    nombre: string
    role: string
    empresa: string | null
  }
}

export interface AvisoFormData {
  ciudad_code: CiudadCode
  categoria: AvisoCategoria
  titulo: string
  descripcion: string
  precio?: number | null
  moneda?: 'MXN' | 'USD'
  whatsapp?: string
  telefono?: string

  // Campos para inmuebles y roomie
  direccion?: string
  direccion_lat?: number
  direccion_lng?: number
  fecha_disponibilidad?: string

  // Campos para inmuebles
  tipo_inmueble?: TipoInmueble
  tiene_cochera?: boolean

  // Campos para roomie e inmuebles
  acepta_mascotas?: boolean
  servicios_incluidos?: ServicioIncluido[]
  precio_todo_incluido?: boolean

  // Campo general (excepto inmuebles)
  servicio_domicilio?: boolean

  // Campos para taxi seguro
  nombre_conductor?: string
  tipo_auto_taxi?: TipoAutoTaxi

  // Página web / link
  pagina_web?: string

  // Solicitud de aviso permanente
  solicita_permanente?: boolean
}

export interface AvisoFilters {
  ciudad_code?: CiudadCode
  categoria?: AvisoCategoria
}

export const AVISO_CATEGORIAS: { id: AvisoCategoria; label: string; emoji: string; description?: string }[] = [
  { id: 'compra', label: 'Compra', emoji: '🛍️', description: 'Busco comprar algo' },
  { id: 'venta', label: 'Venta', emoji: '💰', description: 'Vendo artículos' },
  { id: 'renta_inmueble', label: 'Renta Inmueble', emoji: '🏠', description: 'Rento departamento/casa' },
  { id: 'venta_inmueble', label: 'Venta Inmueble', emoji: '🏡', description: 'Vendo departamento/casa' },
  { id: 'renta_auto', label: 'Renta Auto', emoji: '🚗', description: 'Rento vehículo' },
  { id: 'roomie', label: 'Roomie', emoji: '👥', description: 'Busco/ofrezco roomie' },
  { id: 'taxi_seguro', label: 'Taxi Seguro', emoji: '🚕', description: 'Transporte seguro para tripulaciones' },
  { id: 'servicios', label: 'Servicios', emoji: '🔧', description: 'Ofrezco servicios' },
  { id: 'medico', label: 'Médico', emoji: '🩺', description: 'Servicios médicos' },
  { id: 'otro', label: 'Otro', emoji: '📌', description: 'Otros avisos' },
]

export const TIPO_INMUEBLE_OPTIONS: { id: TipoInmueble; label: string; emoji: string }[] = [
  { id: 'casa', label: 'Casa', emoji: '🏡' },
  { id: 'departamento', label: 'Departamento', emoji: '🏢' },
]

export const TIPO_AUTO_TAXI_OPTIONS: { id: TipoAutoTaxi; label: string; emoji: string }[] = [
  { id: 'compacto', label: 'Compacto', emoji: '🚗' },
  { id: 'camioneta', label: 'Camioneta', emoji: '🚙' },
]

export const SERVICIOS_INCLUIDOS_OPTIONS: { id: ServicioIncluido; label: string; emoji: string }[] = [
  { id: 'internet', label: 'Internet', emoji: '📶' },
  { id: 'agua', label: 'Agua', emoji: '💧' },
  { id: 'luz', label: 'Luz', emoji: '💡' },
  { id: 'gas', label: 'Gas', emoji: '🔥' },
  { id: 'mantenimiento', label: 'Mantenimiento', emoji: '🔧' },
  { id: 'otro', label: 'Otro', emoji: '➕' },
]

export const CIUDADES_INFO: Record<CiudadCode, { city: string; state: string }> = {
  TIJ: { city: 'Tijuana', state: 'BC' },
  BJX: { city: 'León/Bajío', state: 'GTO' },
  GDL: { city: 'Guadalajara', state: 'JAL' },
  MTY: { city: 'Monterrey', state: 'NL' },
  MEX: { city: 'Ciudad de México', state: 'CDMX' },
  CUN: { city: 'Cancún', state: 'QR' },
}

// Helper para saber si la categoría requiere dirección
export function categoriaNecesitaDireccion(categoria: AvisoCategoria): boolean {
  return ['renta_inmueble', 'venta_inmueble', 'roomie', 'venta', 'renta_auto', 'otro'].includes(categoria)
}

// Helper para saber si la categoría es de roomie
export function categoriaEsRoomie(categoria: AvisoCategoria): boolean {
  return categoria === 'roomie'
}

// Helper para saber si la categoría es de inmueble (renta o venta)
export function categoriaEsInmueble(categoria: AvisoCategoria): boolean {
  return ['renta_inmueble', 'venta_inmueble'].includes(categoria)
}

// Helper para saber si la categoría es de taxi seguro
export function categoriaEsTaxi(categoria: AvisoCategoria): boolean {
  return categoria === 'taxi_seguro'
}

// Helper para saber si la categoría permite servicio a domicilio
export function categoriaPermiteDomicilio(categoria: AvisoCategoria): boolean {
  // Excluir inmuebles, roomie y taxi de la opción de domicilio
  return !['renta_inmueble', 'venta_inmueble', 'roomie', 'taxi_seguro'].includes(categoria)
}

// Helper para saber si la categoría permite mascotas (roomie e inmuebles en renta)
export function categoriaPermiteMascotas(categoria: AvisoCategoria): boolean {
  return ['renta_inmueble', 'roomie'].includes(categoria)
}
