// Airports with city names for autocomplete/prediction
export interface Airport {
  code: string
  name: string
  city: string
  state: string
  country?: 'MX' | 'US'
}

export const ALL_AIRPORTS: Airport[] = [
  // ========== MEXICO ==========
  // Principales
  { code: 'MEX', name: 'Aeropuerto Internacional Benito Juárez', city: 'Ciudad de México', state: 'CDMX', country: 'MX' },
  { code: 'GDL', name: 'Aeropuerto Internacional de Guadalajara', city: 'Guadalajara', state: 'Jalisco', country: 'MX' },
  { code: 'MTY', name: 'Aeropuerto Internacional de Monterrey', city: 'Monterrey', state: 'Nuevo León', country: 'MX' },
  { code: 'CUN', name: 'Aeropuerto Internacional de Cancún', city: 'Cancún', state: 'Quintana Roo', country: 'MX' },
  { code: 'TIJ', name: 'Aeropuerto Internacional de Tijuana', city: 'Tijuana', state: 'Baja California', country: 'MX' },
  { code: 'BJX', name: 'Aeropuerto Internacional del Bajío', city: 'León/Silao', state: 'Guanajuato', country: 'MX' },

  // Secundarios importantes
  { code: 'PVR', name: 'Aeropuerto Internacional de Puerto Vallarta', city: 'Puerto Vallarta', state: 'Jalisco', country: 'MX' },
  { code: 'SJD', name: 'Aeropuerto Internacional de Los Cabos', city: 'San José del Cabo', state: 'Baja California Sur', country: 'MX' },
  { code: 'MID', name: 'Aeropuerto Internacional de Mérida', city: 'Mérida', state: 'Yucatán', country: 'MX' },
  { code: 'HMO', name: 'Aeropuerto Internacional de Hermosillo', city: 'Hermosillo', state: 'Sonora', country: 'MX' },
  { code: 'CJS', name: 'Aeropuerto Internacional de Ciudad Juárez', city: 'Ciudad Juárez', state: 'Chihuahua', country: 'MX' },
  { code: 'CUU', name: 'Aeropuerto Internacional de Chihuahua', city: 'Chihuahua', state: 'Chihuahua', country: 'MX' },
  { code: 'MZT', name: 'Aeropuerto Internacional de Mazatlán', city: 'Mazatlán', state: 'Sinaloa', country: 'MX' },
  { code: 'CUL', name: 'Aeropuerto Internacional de Culiacán', city: 'Culiacán', state: 'Sinaloa', country: 'MX' },
  { code: 'AGU', name: 'Aeropuerto Internacional de Aguascalientes', city: 'Aguascalientes', state: 'Aguascalientes', country: 'MX' },
  { code: 'SLP', name: 'Aeropuerto Internacional de San Luis Potosí', city: 'San Luis Potosí', state: 'San Luis Potosí', country: 'MX' },
  { code: 'ZCL', name: 'Aeropuerto Internacional de Zacatecas', city: 'Zacatecas', state: 'Zacatecas', country: 'MX' },
  { code: 'DGO', name: 'Aeropuerto Internacional de Durango', city: 'Durango', state: 'Durango', country: 'MX' },
  { code: 'TRC', name: 'Aeropuerto Internacional de Torreón', city: 'Torreón', state: 'Coahuila', country: 'MX' },
  { code: 'QRO', name: 'Aeropuerto Internacional de Querétaro', city: 'Querétaro', state: 'Querétaro', country: 'MX' },
  { code: 'MLM', name: 'Aeropuerto Internacional de Morelia', city: 'Morelia', state: 'Michoacán', country: 'MX' },
  { code: 'TAM', name: 'Aeropuerto Internacional de Tampico', city: 'Tampico', state: 'Tamaulipas', country: 'MX' },
  { code: 'VER', name: 'Aeropuerto Internacional de Veracruz', city: 'Veracruz', state: 'Veracruz', country: 'MX' },
  { code: 'OAX', name: 'Aeropuerto Internacional de Oaxaca', city: 'Oaxaca', state: 'Oaxaca', country: 'MX' },
  { code: 'VSA', name: 'Aeropuerto Internacional de Villahermosa', city: 'Villahermosa', state: 'Tabasco', country: 'MX' },
  { code: 'TGZ', name: 'Aeropuerto Internacional de Tuxtla Gutiérrez', city: 'Tuxtla Gutiérrez', state: 'Chiapas', country: 'MX' },
  { code: 'CME', name: 'Aeropuerto Internacional de Ciudad del Carmen', city: 'Ciudad del Carmen', state: 'Campeche', country: 'MX' },
  { code: 'ZIH', name: 'Aeropuerto Internacional de Zihuatanejo', city: 'Zihuatanejo', state: 'Guerrero', country: 'MX' },
  { code: 'ACA', name: 'Aeropuerto Internacional de Acapulco', city: 'Acapulco', state: 'Guerrero', country: 'MX' },
  { code: 'HUX', name: 'Aeropuerto Internacional de Huatulco', city: 'Huatulco', state: 'Oaxaca', country: 'MX' },
  { code: 'LAP', name: 'Aeropuerto Internacional de La Paz', city: 'La Paz', state: 'Baja California Sur', country: 'MX' },
  { code: 'LMM', name: 'Aeropuerto Internacional de Los Mochis', city: 'Los Mochis', state: 'Sinaloa', country: 'MX' },
  { code: 'REX', name: 'Aeropuerto Internacional de Reynosa', city: 'Reynosa', state: 'Tamaulipas', country: 'MX' },
  { code: 'NLD', name: 'Aeropuerto Internacional de Nuevo Laredo', city: 'Nuevo Laredo', state: 'Tamaulipas', country: 'MX' },
  { code: 'MAM', name: 'Aeropuerto Internacional de Matamoros', city: 'Matamoros', state: 'Tamaulipas', country: 'MX' },
  { code: 'MXL', name: 'Aeropuerto Internacional de Mexicali', city: 'Mexicali', state: 'Baja California', country: 'MX' },
  { code: 'CZM', name: 'Aeropuerto Internacional de Cozumel', city: 'Cozumel', state: 'Quintana Roo', country: 'MX' },
  { code: 'TLC', name: 'Aeropuerto Internacional de Toluca', city: 'Toluca', state: 'Estado de México', country: 'MX' },
  { code: 'PBC', name: 'Aeropuerto Internacional de Puebla', city: 'Puebla', state: 'Puebla', country: 'MX' },
  { code: 'CPE', name: 'Aeropuerto Internacional de Campeche', city: 'Campeche', state: 'Campeche', country: 'MX' },
  { code: 'PAZ', name: 'Aeropuerto Internacional de Poza Rica', city: 'Poza Rica', state: 'Veracruz', country: 'MX' },
  { code: 'CVM', name: 'Aeropuerto Nacional de Ciudad Victoria', city: 'Ciudad Victoria', state: 'Tamaulipas', country: 'MX' },
  { code: 'UPN', name: 'Aeropuerto Internacional de Uruapan', city: 'Uruapan', state: 'Michoacán', country: 'MX' },
  { code: 'LZC', name: 'Aeropuerto Internacional de Lázaro Cárdenas', city: 'Lázaro Cárdenas', state: 'Michoacán', country: 'MX' },
  { code: 'GYM', name: 'Aeropuerto Internacional de Guaymas', city: 'Guaymas', state: 'Sonora', country: 'MX' },
  { code: 'NLU', name: 'Aeropuerto Internacional Felipe Ángeles', city: 'Santa Lucía', state: 'Estado de México', country: 'MX' },

  // ========== USA ==========
  // California
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'California', country: 'US' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'California', country: 'US' },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'California', country: 'US' },
  { code: 'SJC', name: 'San Jose International Airport', city: 'San Jose', state: 'California', country: 'US' },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'California', country: 'US' },
  { code: 'ONT', name: 'Ontario International Airport', city: 'Ontario', state: 'California', country: 'US' },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', state: 'California', country: 'US' },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Long Beach', state: 'California', country: 'US' },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'California', country: 'US' },
  { code: 'PSP', name: 'Palm Springs International Airport', city: 'Palm Springs', state: 'California', country: 'US' },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Santa Ana', state: 'California', country: 'US' },

  // Texas
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'Texas', country: 'US' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'Texas', country: 'US' },
  { code: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', state: 'Texas', country: 'US' },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'Texas', country: 'US' },
  { code: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', state: 'Texas', country: 'US' },
  { code: 'ELP', name: 'El Paso International Airport', city: 'El Paso', state: 'Texas', country: 'US' },
  { code: 'MFE', name: 'McAllen Miller International Airport', city: 'McAllen', state: 'Texas', country: 'US' },
  { code: 'BRO', name: 'Brownsville/South Padre Island Airport', city: 'Brownsville', state: 'Texas', country: 'US' },
  { code: 'LRD', name: 'Laredo International Airport', city: 'Laredo', state: 'Texas', country: 'US' },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas', state: 'Texas', country: 'US' },

  // Arizona
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'Arizona', country: 'US' },
  { code: 'TUS', name: 'Tucson International Airport', city: 'Tucson', state: 'Arizona', country: 'US' },

  // Nevada
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'Nevada', country: 'US' },
  { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', state: 'Nevada', country: 'US' },

  // Florida
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'Florida', country: 'US' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'Florida', country: 'US' },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'Florida', country: 'US' },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'Florida', country: 'US' },
  { code: 'JAX', name: 'Jacksonville International Airport', city: 'Jacksonville', state: 'Florida', country: 'US' },
  { code: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', state: 'Florida', country: 'US' },
  { code: 'RSW', name: 'Southwest Florida International Airport', city: 'Fort Myers', state: 'Florida', country: 'US' },

  // New York / East Coast
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'New York', country: 'US' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'New Jersey', country: 'US' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', state: 'New York', country: 'US' },
  { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', state: 'Massachusetts', country: 'US' },
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', state: 'Pennsylvania', country: 'US' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington D.C.', state: 'Virginia', country: 'US' },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington D.C.', state: 'Virginia', country: 'US' },
  { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', state: 'Maryland', country: 'US' },

  // Illinois / Midwest
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', state: 'Illinois', country: 'US' },
  { code: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', state: 'Illinois', country: 'US' },
  { code: 'DTW', name: 'Detroit Metropolitan Airport', city: 'Detroit', state: 'Michigan', country: 'US' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', state: 'Minnesota', country: 'US' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'Colorado', country: 'US' },
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'Ohio', country: 'US' },
  { code: 'STL', name: 'St. Louis Lambert International Airport', city: 'St. Louis', state: 'Missouri', country: 'US' },
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'Missouri', country: 'US' },
  { code: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'Indiana', country: 'US' },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', state: 'Ohio', country: 'US' },
  { code: 'CMH', name: 'John Glenn Columbus International Airport', city: 'Columbus', state: 'Ohio', country: 'US' },
  { code: 'MKE', name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', state: 'Wisconsin', country: 'US' },

  // Georgia / Southeast
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'Georgia', country: 'US' },
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'North Carolina', country: 'US' },
  { code: 'RDU', name: 'Raleigh-Durham International Airport', city: 'Raleigh', state: 'North Carolina', country: 'US' },
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'Tennessee', country: 'US' },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'Louisiana', country: 'US' },
  { code: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'Tennessee', country: 'US' },
  { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport', city: 'Birmingham', state: 'Alabama', country: 'US' },

  // Pacific Northwest
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'Washington', country: 'US' },
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'Oregon', country: 'US' },
  { code: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', state: 'Alaska', country: 'US' },

  // Southwest
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', state: 'New Mexico', country: 'US' },
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'Utah', country: 'US' },
  { code: 'OKC', name: 'Will Rogers World Airport', city: 'Oklahoma City', state: 'Oklahoma', country: 'US' },
  { code: 'TUL', name: 'Tulsa International Airport', city: 'Tulsa', state: 'Oklahoma', country: 'US' },

  // Hawaii
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', state: 'Hawaii', country: 'US' },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', state: 'Hawaii', country: 'US' },
  { code: 'KOA', name: 'Ellison Onizuka Kona International Airport', city: 'Kailua-Kona', state: 'Hawaii', country: 'US' },
  { code: 'LIH', name: 'Lihue Airport', city: 'Lihue', state: 'Hawaii', country: 'US' },

  // Puerto Rico
  { code: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', state: 'Puerto Rico', country: 'US' },
]

// Backwards compatibility - Mexican airports only
export const MEXICAN_AIRPORTS = ALL_AIRPORTS.filter(a => a.country === 'MX')

// USA airports only
export const USA_AIRPORTS = ALL_AIRPORTS.filter(a => a.country === 'US')

// Search function for autocomplete - searches all airports
export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 1) return []

  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  return ALL_AIRPORTS.filter(airport => {
    const normalizedCode = airport.code.toLowerCase()
    const normalizedCity = airport.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normalizedName = airport.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normalizedState = airport.state.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    return (
      normalizedCode.includes(normalizedQuery) ||
      normalizedCity.includes(normalizedQuery) ||
      normalizedName.includes(normalizedQuery) ||
      normalizedState.includes(normalizedQuery)
    )
  }).slice(0, 10) // Limit results
}

// Get airport by code
export function getAirportByCode(code: string): Airport | undefined {
  return ALL_AIRPORTS.find(a => a.code.toUpperCase() === code.toUpperCase())
}

// Main cities for avisos de ocasión (Mexico only)
export const AVISO_CIUDADES = [
  { code: 'TIJ', city: 'Tijuana', state: 'BC' },
  { code: 'BJX', city: 'León/Bajío', state: 'GTO' },
  { code: 'GDL', city: 'Guadalajara', state: 'JAL' },
  { code: 'MTY', city: 'Monterrey', state: 'NL' },
  { code: 'MEX', city: 'Ciudad de México', state: 'CDMX' },
  { code: 'CUN', city: 'Cancún', state: 'QR' },
] as const

export type AvisoCiudad = typeof AVISO_CIUDADES[number]
