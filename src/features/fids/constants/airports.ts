// Comprehensive airport database for FIDS
// Includes Mexican airports and common international destinations

export interface Airport {
  code: string
  name: string
  city: string
  country: string
  hasTerminals: boolean
  terminals: string[]
}

export const AIRPORTS: Airport[] = [
  // Mexican Airports - Major
  { code: 'MEX', name: 'Aeropuerto Internacional Benito Juárez', city: 'Ciudad de México', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CUN', name: 'Aeropuerto Internacional de Cancún', city: 'Cancún', country: 'México', hasTerminals: true, terminals: ['1', '2', '3', '4'] },
  { code: 'GDL', name: 'Aeropuerto Internacional de Guadalajara', city: 'Guadalajara', country: 'México', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'MTY', name: 'Aeropuerto Internacional de Monterrey', city: 'Monterrey', country: 'México', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'TIJ', name: 'Aeropuerto Internacional de Tijuana', city: 'Tijuana', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'SJD', name: 'Aeropuerto Internacional de Los Cabos', city: 'San José del Cabo', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PVR', name: 'Aeropuerto Internacional de Puerto Vallarta', city: 'Puerto Vallarta', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MID', name: 'Aeropuerto Internacional de Mérida', city: 'Mérida', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'HMO', name: 'Aeropuerto Internacional de Hermosillo', city: 'Hermosillo', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CUL', name: 'Aeropuerto Internacional de Culiacán', city: 'Culiacán', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ZIH', name: 'Aeropuerto Internacional de Zihuatanejo', city: 'Zihuatanejo', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'OAX', name: 'Aeropuerto Internacional de Oaxaca', city: 'Oaxaca', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'BJX', name: 'Aeropuerto Internacional del Bajío', city: 'León', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'VER', name: 'Aeropuerto Internacional de Veracruz', city: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CME', name: 'Aeropuerto Internacional de Ciudad del Carmen', city: 'Ciudad del Carmen', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'VSA', name: 'Aeropuerto Internacional de Villahermosa', city: 'Villahermosa', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'TAM', name: 'Aeropuerto Internacional de Tampico', city: 'Tampico', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'AGU', name: 'Aeropuerto Internacional de Aguascalientes', city: 'Aguascalientes', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'SLP', name: 'Aeropuerto Internacional de San Luis Potosí', city: 'San Luis Potosí', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ZCL', name: 'Aeropuerto Internacional de Zacatecas', city: 'Zacatecas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CZM', name: 'Aeropuerto Internacional de Cozumel', city: 'Cozumel', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ACA', name: 'Aeropuerto Internacional de Acapulco', city: 'Acapulco', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MLM', name: 'Aeropuerto Internacional de Morelia', city: 'Morelia', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'QRO', name: 'Aeropuerto Internacional de Querétaro', city: 'Querétaro', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'TRC', name: 'Aeropuerto Internacional de Torreón', city: 'Torreón', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CJS', name: 'Aeropuerto Internacional de Ciudad Juárez', city: 'Ciudad Juárez', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MZT', name: 'Aeropuerto Internacional de Mazatlán', city: 'Mazatlán', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LAP', name: 'Aeropuerto Internacional de La Paz', city: 'La Paz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'REX', name: 'Aeropuerto Internacional de Reynosa', city: 'Reynosa', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'NLD', name: 'Aeropuerto Internacional de Nuevo Laredo', city: 'Nuevo Laredo', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CLQ', name: 'Aeropuerto Internacional de Colima', city: 'Colima', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'TGZ', name: 'Aeropuerto Internacional de Tuxtla Gutiérrez', city: 'Tuxtla Gutiérrez', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CTM', name: 'Aeropuerto Internacional de Chetumal', city: 'Chetumal', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CPE', name: 'Aeropuerto Internacional de Campeche', city: 'Campeche', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PAZ', name: 'Aeropuerto Internacional de Poza Rica', city: 'Poza Rica', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'UPN', name: 'Aeropuerto Internacional de Uruapan', city: 'Uruapan', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LMM', name: 'Aeropuerto Internacional de Los Mochis', city: 'Los Mochis', country: 'México', hasTerminals: false, terminals: [] },

  // Central America
  { code: 'GUA', name: 'Aeropuerto Internacional La Aurora', city: 'Ciudad de Guatemala', country: 'Guatemala', hasTerminals: false, terminals: [] },
  { code: 'SAL', name: 'Aeropuerto Internacional El Salvador', city: 'San Salvador', country: 'El Salvador', hasTerminals: false, terminals: [] },
  { code: 'SAP', name: 'Aeropuerto Internacional Ramón Villeda Morales', city: 'San Pedro Sula', country: 'Honduras', hasTerminals: false, terminals: [] },
  { code: 'MGA', name: 'Aeropuerto Internacional Augusto C. Sandino', city: 'Managua', country: 'Nicaragua', hasTerminals: false, terminals: [] },
  { code: 'SJO', name: 'Aeropuerto Internacional Juan Santamaría', city: 'San José', country: 'Costa Rica', hasTerminals: false, terminals: [] },
  { code: 'PTY', name: 'Aeropuerto Internacional de Tocumen', city: 'Ciudad de Panamá', country: 'Panamá', hasTerminals: false, terminals: [] },

  // South America
  { code: 'BOG', name: 'Aeropuerto Internacional El Dorado', city: 'Bogotá', country: 'Colombia', hasTerminals: false, terminals: [] },

  // Caribbean
  { code: 'HAV', name: 'Aeropuerto Internacional José Martí', city: 'La Habana', country: 'Cuba', hasTerminals: false, terminals: [] },

  // United States
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Ángeles', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', '4', '5', '6', '7', '8', 'B'] },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'Nueva York', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '4', '5', '7', '8'] },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', '5'] },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'Estados Unidos', hasTerminals: true, terminals: ['2', '3', '4'] },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', 'G'] },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '3'] },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'Estados Unidos', hasTerminals: true, terminals: ['T', 'A', 'B', 'C', 'D', 'E', 'F'] },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
]

// Map for quick lookup by code
export const AIRPORT_MAP = new Map(AIRPORTS.map(a => [a.code, a]))

// Get airport by code
export function getAirport(code: string): Airport | undefined {
  return AIRPORT_MAP.get(code.toUpperCase())
}

// Search airports by query (code, city, or name)
export function searchAirports(query: string, limit = 10): Airport[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return AIRPORTS
    .filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

// Get city name from code (for display)
export function getCityName(code: string): string {
  const airport = getAirport(code)
  return airport?.city || code
}

// Get terminal options for airport
export function getTerminalOptions(code: string): string[] {
  const airport = getAirport(code)
  return airport?.terminals || []
}

// Check if airport has terminals
export function hasTerminals(code: string): boolean {
  const airport = getAirport(code)
  return airport?.hasTerminals || false
}
