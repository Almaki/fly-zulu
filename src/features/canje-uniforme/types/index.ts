export type Base = 'TIJ' | 'MTY' | 'BJX' | 'GDL' | 'MEX' | 'CUN'
export type Tipo = 'TENGO' | 'REQUIERO'
export type Prenda = 'GABARDINA' | 'PANTALON' | 'KEPI' | 'CAMISA MC' | 'CAMISA ML'
export type Genero = 'M' | 'F'
export type EstadoPub = 'activo' | 'resuelto'
export type TipoMatch = 'directo' | 'pool'

export interface Publicacion {
  id: string
  numero_rol: string
  base: Base
  tipo: Tipo
  prenda: Prenda
  talla: string
  genero: Genero
  en_pool: boolean
  estado: EstadoPub
  resuelto_por: string[]
  created_at: string
}

export interface Mensaje {
  id: string
  chat_key: string
  numero_rol: string
  mensaje: string
  created_at: string
}

export interface Match {
  tengo: Publicacion
  requiero: Publicacion
  chat_key: string
  tipo: TipoMatch
  mismo_base: boolean
}

export interface PilotoActual {
  numero_rol: string
  base: Base
}

export const BASES: Base[] = ['TIJ', 'MTY', 'BJX', 'GDL', 'MEX', 'CUN']
export const PRENDAS: Prenda[] = ['GABARDINA', 'PANTALON', 'KEPI', 'CAMISA MC', 'CAMISA ML']

export const BASE_LABELS: Record<Base, string> = {
  TIJ: 'Tijuana (TIJ)',
  MTY: 'Monterrey (MTY)',
  BJX: 'Bajío (BJX)',
  GDL: 'Guadalajara (GDL)',
  MEX: 'Ciudad de México (MEX)',
  CUN: 'Cancún (CUN)',
}

export const PRENDA_ICONS: Record<Prenda, string> = {
  GABARDINA: '🧥',
  PANTALON: '👖',
  KEPI: '🧢',
  'CAMISA MC': '👔',
  'CAMISA ML': '🥼',
}
