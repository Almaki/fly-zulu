// Comprehensive airport database for FIDS
// Includes all Mexican airports and major US airports

export interface Airport {
  code: string
  name: string
  city: string
  country: string
  state?: string // Estado/Province for better search
  hasTerminals: boolean
  terminals: string[]
}

export const AIRPORTS: Airport[] = [
  // ============================================
  // MÉXICO - TODOS LOS AEROPUERTOS COMERCIALES
  // ============================================

  // Aguascalientes
  { code: 'AGU', name: 'Aeropuerto Internacional Jesús Terán Peredo', city: 'Aguascalientes', state: 'Aguascalientes', country: 'México', hasTerminals: false, terminals: [] },

  // Baja California
  { code: 'TIJ', name: 'Aeropuerto Internacional General Abelardo L. Rodríguez', city: 'Tijuana', state: 'Baja California', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MXL', name: 'Aeropuerto Internacional General Rodolfo Sánchez Taboada', city: 'Mexicali', state: 'Baja California', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ENS', name: 'Aeropuerto Internacional El Ciprés', city: 'Ensenada', state: 'Baja California', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'SFH', name: 'Aeropuerto Internacional San Felipe', city: 'San Felipe', state: 'Baja California', country: 'México', hasTerminals: false, terminals: [] },

  // Baja California Sur
  { code: 'SJD', name: 'Aeropuerto Internacional de Los Cabos', city: 'San José del Cabo', state: 'Baja California Sur', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LAP', name: 'Aeropuerto Internacional Manuel Márquez de León', city: 'La Paz', state: 'Baja California Sur', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LTO', name: 'Aeropuerto Internacional de Loreto', city: 'Loreto', state: 'Baja California Sur', country: 'México', hasTerminals: false, terminals: [] },

  // Campeche
  { code: 'CPE', name: 'Aeropuerto Internacional Alberto Acuña Ongay', city: 'Campeche', state: 'Campeche', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CME', name: 'Aeropuerto Internacional de Ciudad del Carmen', city: 'Ciudad del Carmen', state: 'Campeche', country: 'México', hasTerminals: false, terminals: [] },

  // Chiapas
  { code: 'TGZ', name: 'Aeropuerto Internacional Ángel Albino Corzo', city: 'Tuxtla Gutiérrez', state: 'Chiapas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'TAP', name: 'Aeropuerto Internacional de Tapachula', city: 'Tapachula', state: 'Chiapas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PQM', name: 'Aeropuerto Nacional de Palenque', city: 'Palenque', state: 'Chiapas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CNA', name: 'Aeropuerto Nacional de San Cristóbal de las Casas', city: 'San Cristóbal de las Casas', state: 'Chiapas', country: 'México', hasTerminals: false, terminals: [] },

  // Chihuahua
  { code: 'CUU', name: 'Aeropuerto Internacional General Roberto Fierro Villalobos', city: 'Chihuahua', state: 'Chihuahua', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CJS', name: 'Aeropuerto Internacional Abraham González', city: 'Ciudad Juárez', state: 'Chihuahua', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CUP', name: 'Aeropuerto Nacional General Francisco Villa', city: 'Cuauhtémoc', state: 'Chihuahua', country: 'México', hasTerminals: false, terminals: [] },

  // Ciudad de México
  { code: 'MEX', name: 'Aeropuerto Internacional Benito Juárez', city: 'Ciudad de México', state: 'CDMX', country: 'México', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'NLU', name: 'Aeropuerto Internacional Felipe Ángeles', city: 'Santa Lucía', state: 'Estado de México', country: 'México', hasTerminals: false, terminals: [] },

  // Coahuila
  { code: 'TRC', name: 'Aeropuerto Internacional Francisco Sarabia', city: 'Torreón', state: 'Coahuila', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'SLW', name: 'Aeropuerto Internacional Plan de Guadalupe', city: 'Saltillo', state: 'Coahuila', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MOV', name: 'Aeropuerto Internacional de Monclova', city: 'Monclova', state: 'Coahuila', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ACN', name: 'Aeropuerto Internacional de Ciudad Acuña', city: 'Ciudad Acuña', state: 'Coahuila', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PDS', name: 'Aeropuerto Internacional de Piedras Negras', city: 'Piedras Negras', state: 'Coahuila', country: 'México', hasTerminals: false, terminals: [] },

  // Colima
  { code: 'CLQ', name: 'Aeropuerto Nacional Miguel de la Madrid', city: 'Colima', state: 'Colima', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ZLO', name: 'Aeropuerto Internacional Playa de Oro', city: 'Manzanillo', state: 'Colima', country: 'México', hasTerminals: false, terminals: [] },

  // Durango
  { code: 'DGO', name: 'Aeropuerto Internacional General Guadalupe Victoria', city: 'Durango', state: 'Durango', country: 'México', hasTerminals: false, terminals: [] },

  // Guanajuato
  { code: 'BJX', name: 'Aeropuerto Internacional del Bajío', city: 'León', state: 'Guanajuato', country: 'México', hasTerminals: false, terminals: [] },

  // Guerrero
  { code: 'ACA', name: 'Aeropuerto Internacional General Juan N. Álvarez', city: 'Acapulco', state: 'Guerrero', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'ZIH', name: 'Aeropuerto Internacional de Ixtapa-Zihuatanejo', city: 'Zihuatanejo', state: 'Guerrero', country: 'México', hasTerminals: false, terminals: [] },

  // Hidalgo
  { code: 'PAC', name: 'Aeropuerto Nacional de Pachuca', city: 'Pachuca', state: 'Hidalgo', country: 'México', hasTerminals: false, terminals: [] },

  // Jalisco
  { code: 'GDL', name: 'Aeropuerto Internacional Miguel Hidalgo y Costilla', city: 'Guadalajara', state: 'Jalisco', country: 'México', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'PVR', name: 'Aeropuerto Internacional Gustavo Díaz Ordaz', city: 'Puerto Vallarta', state: 'Jalisco', country: 'México', hasTerminals: false, terminals: [] },

  // Michoacán
  { code: 'MLM', name: 'Aeropuerto Internacional General Francisco J. Mújica', city: 'Morelia', state: 'Michoacán', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'UPN', name: 'Aeropuerto Internacional Ignacio López Rayón', city: 'Uruapan', state: 'Michoacán', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LZC', name: 'Aeropuerto Internacional de Lázaro Cárdenas', city: 'Lázaro Cárdenas', state: 'Michoacán', country: 'México', hasTerminals: false, terminals: [] },

  // Morelos
  { code: 'CVJ', name: 'Aeropuerto Nacional General Mariano Matamoros', city: 'Cuernavaca', state: 'Morelos', country: 'México', hasTerminals: false, terminals: [] },

  // Nayarit
  { code: 'TPQ', name: 'Aeropuerto Internacional Amado Nervo', city: 'Tepic', state: 'Nayarit', country: 'México', hasTerminals: false, terminals: [] },

  // Nuevo León
  { code: 'MTY', name: 'Aeropuerto Internacional General Mariano Escobedo', city: 'Monterrey', state: 'Nuevo León', country: 'México', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'NTR', name: 'Aeropuerto Internacional Del Norte', city: 'Monterrey', state: 'Nuevo León', country: 'México', hasTerminals: false, terminals: [] },

  // Oaxaca
  { code: 'OAX', name: 'Aeropuerto Internacional Xoxocotlán', city: 'Oaxaca', state: 'Oaxaca', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'HUX', name: 'Aeropuerto Internacional de Bahías de Huatulco', city: 'Huatulco', state: 'Oaxaca', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PXM', name: 'Aeropuerto Internacional de Puerto Escondido', city: 'Puerto Escondido', state: 'Oaxaca', country: 'México', hasTerminals: false, terminals: [] },

  // Puebla
  { code: 'PBC', name: 'Aeropuerto Internacional Hermanos Serdán', city: 'Puebla', state: 'Puebla', country: 'México', hasTerminals: false, terminals: [] },

  // Querétaro
  { code: 'QRO', name: 'Aeropuerto Internacional de Querétaro', city: 'Querétaro', state: 'Querétaro', country: 'México', hasTerminals: false, terminals: [] },

  // Quintana Roo
  { code: 'CUN', name: 'Aeropuerto Internacional de Cancún', city: 'Cancún', state: 'Quintana Roo', country: 'México', hasTerminals: true, terminals: ['1', '2', '3', '4'] },
  { code: 'CZM', name: 'Aeropuerto Internacional de Cozumel', city: 'Cozumel', state: 'Quintana Roo', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CTM', name: 'Aeropuerto Internacional de Chetumal', city: 'Chetumal', state: 'Quintana Roo', country: 'México', hasTerminals: false, terminals: [] },

  // San Luis Potosí
  { code: 'SLP', name: 'Aeropuerto Internacional Ponciano Arriaga', city: 'San Luis Potosí', state: 'San Luis Potosí', country: 'México', hasTerminals: false, terminals: [] },

  // Sinaloa
  { code: 'CUL', name: 'Aeropuerto Internacional Federal de Bachigualato', city: 'Culiacán', state: 'Sinaloa', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MZT', name: 'Aeropuerto Internacional General Rafael Buelna', city: 'Mazatlán', state: 'Sinaloa', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'LMM', name: 'Aeropuerto Internacional Federal del Valle del Fuerte', city: 'Los Mochis', state: 'Sinaloa', country: 'México', hasTerminals: false, terminals: [] },

  // Sonora
  { code: 'HMO', name: 'Aeropuerto Internacional General Ignacio Pesqueira García', city: 'Hermosillo', state: 'Sonora', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CEN', name: 'Aeropuerto Internacional de Ciudad Obregón', city: 'Ciudad Obregón', state: 'Sonora', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'GYM', name: 'Aeropuerto Internacional General José María Yáñez', city: 'Guaymas', state: 'Sonora', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'NOG', name: 'Aeropuerto Internacional de Nogales', city: 'Nogales', state: 'Sonora', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PPE', name: 'Aeropuerto Internacional Mar de Cortés', city: 'Puerto Peñasco', state: 'Sonora', country: 'México', hasTerminals: false, terminals: [] },

  // Tabasco
  { code: 'VSA', name: 'Aeropuerto Internacional Carlos Rovirosa Pérez', city: 'Villahermosa', state: 'Tabasco', country: 'México', hasTerminals: false, terminals: [] },

  // Tamaulipas
  { code: 'TAM', name: 'Aeropuerto Internacional General Francisco Javier Mina', city: 'Tampico', state: 'Tamaulipas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'REX', name: 'Aeropuerto Internacional General Lucio Blanco', city: 'Reynosa', state: 'Tamaulipas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'NLD', name: 'Aeropuerto Internacional Quetzalcóatl', city: 'Nuevo Laredo', state: 'Tamaulipas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MAM', name: 'Aeropuerto Internacional General Servando Canales', city: 'Matamoros', state: 'Tamaulipas', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CVM', name: 'Aeropuerto Nacional Pedro J. Méndez', city: 'Ciudad Victoria', state: 'Tamaulipas', country: 'México', hasTerminals: false, terminals: [] },

  // Tlaxcala
  { code: 'TLC', name: 'Aeropuerto Internacional Adolfo López Mateos', city: 'Toluca', state: 'Estado de México', country: 'México', hasTerminals: false, terminals: [] },

  // Veracruz
  { code: 'VER', name: 'Aeropuerto Internacional General Heriberto Jara Corona', city: 'Veracruz', state: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'PAZ', name: 'Aeropuerto Nacional El Tajín', city: 'Poza Rica', state: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'JAL', name: 'Aeropuerto Nacional El Lencero', city: 'Xalapa', state: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'MTT', name: 'Aeropuerto Nacional de Minatitlán', city: 'Minatitlán', state: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },
  { code: 'CTC', name: 'Aeropuerto Nacional de Coatzacoalcos', city: 'Coatzacoalcos', state: 'Veracruz', country: 'México', hasTerminals: false, terminals: [] },

  // Yucatán
  { code: 'MID', name: 'Aeropuerto Internacional Manuel Crescencio Rejón', city: 'Mérida', state: 'Yucatán', country: 'México', hasTerminals: false, terminals: [] },

  // Zacatecas
  { code: 'ZCL', name: 'Aeropuerto Internacional General Leobardo C. Ruiz', city: 'Zacatecas', state: 'Zacatecas', country: 'México', hasTerminals: false, terminals: [] },

  // ============================================
  // ESTADOS UNIDOS - AEROPUERTOS PRINCIPALES
  // ============================================

  // Alabama
  { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport', city: 'Birmingham', state: 'Alabama', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'HSV', name: 'Huntsville International Airport', city: 'Huntsville', state: 'Alabama', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MOB', name: 'Mobile Regional Airport', city: 'Mobile', state: 'Alabama', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Alaska
  { code: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', state: 'Alaska', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'FAI', name: 'Fairbanks International Airport', city: 'Fairbanks', state: 'Alaska', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'JNU', name: 'Juneau International Airport', city: 'Juneau', state: 'Alaska', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Arizona
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'Arizona', country: 'Estados Unidos', hasTerminals: true, terminals: ['2', '3', '4'] },
  { code: 'TUS', name: 'Tucson International Airport', city: 'Tucson', state: 'Arizona', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'AZA', name: 'Phoenix-Mesa Gateway Airport', city: 'Mesa', state: 'Arizona', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'FLG', name: 'Flagstaff Pulliam Airport', city: 'Flagstaff', state: 'Arizona', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'YUM', name: 'Yuma International Airport', city: 'Yuma', state: 'Arizona', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Arkansas
  { code: 'LIT', name: 'Bill and Hillary Clinton National Airport', city: 'Little Rock', state: 'Arkansas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'XNA', name: 'Northwest Arkansas National Airport', city: 'Bentonville', state: 'Arkansas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // California
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Ángeles', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', '4', '5', '6', '7', '8', 'B'] },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', 'G'] },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'SJC', name: 'San José International Airport', city: 'San José', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', state: 'California', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Long Beach', state: 'California', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'ONT', name: 'Ontario International Airport', city: 'Ontario', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['2', '4'] },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Santa Ana', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'California', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'PSP', name: 'Palm Springs International Airport', city: 'Palm Springs', state: 'California', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'FAT', name: 'Fresno Yosemite International Airport', city: 'Fresno', state: 'California', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'SBA', name: 'Santa Barbara Airport', city: 'Santa Barbara', state: 'California', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Colorado
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'Colorado', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'COS', name: 'Colorado Springs Airport', city: 'Colorado Springs', state: 'Colorado', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'ASE', name: 'Aspen/Pitkin County Airport', city: 'Aspen', state: 'Colorado', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'EGE', name: 'Eagle County Regional Airport', city: 'Vail', state: 'Colorado', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Connecticut
  { code: 'BDL', name: 'Bradley International Airport', city: 'Hartford', state: 'Connecticut', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Delaware
  { code: 'ILG', name: 'Wilmington Airport', city: 'Wilmington', state: 'Delaware', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Florida
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'Florida', country: 'Estados Unidos', hasTerminals: true, terminals: ['D', 'E', 'F', 'G', 'H', 'J', 'N'] },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'Florida', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'Florida', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', '4'] },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'Florida', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'C', 'E', 'F'] },
  { code: 'JAX', name: 'Jacksonville International Airport', city: 'Jacksonville', state: 'Florida', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', state: 'Florida', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'RSW', name: 'Southwest Florida International Airport', city: 'Fort Myers', state: 'Florida', country: 'Estados Unidos', hasTerminals: true, terminals: ['B', 'C', 'D'] },
  { code: 'SRQ', name: 'Sarasota-Bradenton International Airport', city: 'Sarasota', state: 'Florida', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'EYW', name: 'Key West International Airport', city: 'Key West', state: 'Florida', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'PNS', name: 'Pensacola International Airport', city: 'Pensacola', state: 'Florida', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Georgia
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'Georgia', country: 'Estados Unidos', hasTerminals: true, terminals: ['T', 'A', 'B', 'C', 'D', 'E', 'F'] },
  { code: 'SAV', name: 'Savannah/Hilton Head International Airport', city: 'Savannah', state: 'Georgia', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Hawaii
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', state: 'Hawaii', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', state: 'Hawaii', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'KOA', name: 'Ellison Onizuka Kona International Airport', city: 'Kona', state: 'Hawaii', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'LIH', name: 'Lihue Airport', city: 'Kauai', state: 'Hawaii', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Idaho
  { code: 'BOI', name: 'Boise Airport', city: 'Boise', state: 'Idaho', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Illinois
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', state: 'Illinois', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '3', '5'] },
  { code: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', state: 'Illinois', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Indiana
  { code: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'Indiana', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'FWA', name: 'Fort Wayne International Airport', city: 'Fort Wayne', state: 'Indiana', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Iowa
  { code: 'DSM', name: 'Des Moines International Airport', city: 'Des Moines', state: 'Iowa', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Kansas
  { code: 'ICT', name: 'Wichita Dwight D. Eisenhower National Airport', city: 'Wichita', state: 'Kansas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'Missouri', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Kentucky
  { code: 'SDF', name: 'Louisville Muhammad Ali International Airport', city: 'Louisville', state: 'Kentucky', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', state: 'Kentucky', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'LEX', name: 'Blue Grass Airport', city: 'Lexington', state: 'Kentucky', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Louisiana
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'Nueva Orleans', state: 'Louisiana', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D'] },
  { code: 'BTR', name: 'Baton Rouge Metropolitan Airport', city: 'Baton Rouge', state: 'Louisiana', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Maine
  { code: 'PWM', name: 'Portland International Jetport', city: 'Portland', state: 'Maine', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Maryland
  { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', state: 'Maryland', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },

  // Massachusetts
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', state: 'Massachusetts', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'E'] },

  // Michigan
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', state: 'Michigan', country: 'Estados Unidos', hasTerminals: true, terminals: ['EM', 'NM'] },
  { code: 'GRR', name: 'Gerald R. Ford International Airport', city: 'Grand Rapids', state: 'Michigan', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'FNT', name: 'Bishop International Airport', city: 'Flint', state: 'Michigan', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'LAN', name: 'Capital Region International Airport', city: 'Lansing', state: 'Michigan', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Minnesota
  { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', state: 'Minnesota', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },

  // Mississippi
  { code: 'JAN', name: 'Jackson-Medgar Wiley Evers International Airport', city: 'Jackson', state: 'Mississippi', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Missouri
  { code: 'STL', name: 'St. Louis Lambert International Airport', city: 'St. Louis', state: 'Missouri', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },

  // Montana
  { code: 'BZN', name: 'Bozeman Yellowstone International Airport', city: 'Bozeman', state: 'Montana', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'BIL', name: 'Billings Logan International Airport', city: 'Billings', state: 'Montana', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MSO', name: 'Missoula Montana Airport', city: 'Missoula', state: 'Montana', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Nebraska
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha', state: 'Nebraska', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Nevada
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'Nevada', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '3'] },
  { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', state: 'Nevada', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // New Hampshire
  { code: 'MHT', name: 'Manchester-Boston Regional Airport', city: 'Manchester', state: 'New Hampshire', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // New Jersey
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'New Jersey', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },

  // New Mexico
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', state: 'New Mexico', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'SAF', name: 'Santa Fe Regional Airport', city: 'Santa Fe', state: 'New Mexico', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // New York
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'Nueva York', state: 'New York', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2', '4', '5', '7', '8'] },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'Nueva York', state: 'New York', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D'] },
  { code: 'BUF', name: 'Buffalo Niagara International Airport', city: 'Buffalo', state: 'New York', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'SYR', name: 'Syracuse Hancock International Airport', city: 'Syracuse', state: 'New York', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'ROC', name: 'Frederick Douglass Greater Rochester International Airport', city: 'Rochester', state: 'New York', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'ALB', name: 'Albany International Airport', city: 'Albany', state: 'New York', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // North Carolina
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'North Carolina', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'RDU', name: 'Raleigh-Durham International Airport', city: 'Raleigh', state: 'North Carolina', country: 'Estados Unidos', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'GSO', name: 'Piedmont Triad International Airport', city: 'Greensboro', state: 'North Carolina', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // North Dakota
  { code: 'FAR', name: 'Hector International Airport', city: 'Fargo', state: 'North Dakota', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Ohio
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'Ohio', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'CMH', name: 'John Glenn Columbus International Airport', city: 'Columbus', state: 'Ohio', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'DAY', name: 'Dayton International Airport', city: 'Dayton', state: 'Ohio', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'CAK', name: 'Akron-Canton Airport', city: 'Akron', state: 'Ohio', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Oklahoma
  { code: 'OKC', name: 'Will Rogers World Airport', city: 'Oklahoma City', state: 'Oklahoma', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'TUL', name: 'Tulsa International Airport', city: 'Tulsa', state: 'Oklahoma', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Oregon
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'Oregon', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'EUG', name: 'Eugene Airport', city: 'Eugene', state: 'Oregon', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MFR', name: 'Rogue Valley International-Medford Airport', city: 'Medford', state: 'Oregon', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Pennsylvania
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Filadelfia', state: 'Pennsylvania', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E', 'F'] },
  { code: 'PIT', name: 'Pittsburgh International Airport', city: 'Pittsburgh', state: 'Pennsylvania', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Rhode Island
  { code: 'PVD', name: 'T.F. Green International Airport', city: 'Providence', state: 'Rhode Island', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // South Carolina
  { code: 'CHS', name: 'Charleston International Airport', city: 'Charleston', state: 'South Carolina', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MYR', name: 'Myrtle Beach International Airport', city: 'Myrtle Beach', state: 'South Carolina', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'GSP', name: 'Greenville-Spartanburg International Airport', city: 'Greenville', state: 'South Carolina', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // South Dakota
  { code: 'RAP', name: 'Rapid City Regional Airport', city: 'Rapid City', state: 'South Dakota', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'FSD', name: 'Sioux Falls Regional Airport', city: 'Sioux Falls', state: 'South Dakota', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Tennessee
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'Tennessee', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D'] },
  { code: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'Tennessee', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'TYS', name: 'McGhee Tyson Airport', city: 'Knoxville', state: 'Tennessee', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Texas
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'Texas', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'Texas', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'E'] },
  { code: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', state: 'Texas', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', state: 'Texas', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'ELP', name: 'El Paso International Airport', city: 'El Paso', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'LBB', name: 'Lubbock Preston Smith International Airport', city: 'Lubbock', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MFE', name: 'McAllen Miller International Airport', city: 'McAllen', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'HRL', name: 'Valley International Airport', city: 'Harlingen', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'BRO', name: 'Brownsville South Padre Island International Airport', city: 'Brownsville', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'CRP', name: 'Corpus Christi International Airport', city: 'Corpus Christi', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'LRD', name: 'Laredo International Airport', city: 'Laredo', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'MAF', name: 'Midland International Air and Space Port', city: 'Midland', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'AMA', name: 'Rick Husband Amarillo International Airport', city: 'Amarillo', state: 'Texas', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Utah
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'Utah', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B'] },

  // Vermont
  { code: 'BTV', name: 'Burlington International Airport', city: 'Burlington', state: 'Vermont', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Virginia
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington D.C.', state: 'Virginia', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D'] },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington D.C.', state: 'Virginia', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'ORF', name: 'Norfolk International Airport', city: 'Norfolk', state: 'Virginia', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'RIC', name: 'Richmond International Airport', city: 'Richmond', state: 'Virginia', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Washington
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'Washington', country: 'Estados Unidos', hasTerminals: true, terminals: ['A', 'B', 'C', 'D', 'N', 'S'] },
  { code: 'GEG', name: 'Spokane International Airport', city: 'Spokane', state: 'Washington', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'BLI', name: 'Bellingham International Airport', city: 'Bellingham', state: 'Washington', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // West Virginia
  { code: 'CRW', name: 'Yeager Airport', city: 'Charleston', state: 'West Virginia', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Wisconsin
  { code: 'MKE', name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', state: 'Wisconsin', country: 'Estados Unidos', hasTerminals: true, terminals: ['C', 'D', 'E'] },
  { code: 'MSN', name: 'Dane County Regional Airport', city: 'Madison', state: 'Wisconsin', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // Wyoming
  { code: 'JAC', name: 'Jackson Hole Airport', city: 'Jackson Hole', state: 'Wyoming', country: 'Estados Unidos', hasTerminals: false, terminals: [] },
  { code: 'CYS', name: 'Cheyenne Regional Airport', city: 'Cheyenne', state: 'Wyoming', country: 'Estados Unidos', hasTerminals: false, terminals: [] },

  // ============================================
  // CENTROAMÉRICA Y CARIBE
  // ============================================
  { code: 'GUA', name: 'Aeropuerto Internacional La Aurora', city: 'Ciudad de Guatemala', country: 'Guatemala', hasTerminals: false, terminals: [] },
  { code: 'SAL', name: 'Aeropuerto Internacional Monseñor Óscar Arnulfo Romero', city: 'San Salvador', country: 'El Salvador', hasTerminals: false, terminals: [] },
  { code: 'SAP', name: 'Aeropuerto Internacional Ramón Villeda Morales', city: 'San Pedro Sula', country: 'Honduras', hasTerminals: false, terminals: [] },
  { code: 'TGU', name: 'Aeropuerto Internacional Toncontín', city: 'Tegucigalpa', country: 'Honduras', hasTerminals: false, terminals: [] },
  { code: 'MGA', name: 'Aeropuerto Internacional Augusto C. Sandino', city: 'Managua', country: 'Nicaragua', hasTerminals: false, terminals: [] },
  { code: 'SJO', name: 'Aeropuerto Internacional Juan Santamaría', city: 'San José', country: 'Costa Rica', hasTerminals: false, terminals: [] },
  { code: 'LIR', name: 'Aeropuerto Internacional Daniel Oduber Quirós', city: 'Liberia', country: 'Costa Rica', hasTerminals: false, terminals: [] },
  { code: 'PTY', name: 'Aeropuerto Internacional de Tocumen', city: 'Ciudad de Panamá', country: 'Panamá', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'HAV', name: 'Aeropuerto Internacional José Martí', city: 'La Habana', country: 'Cuba', hasTerminals: true, terminals: ['1', '2', '3'] },
  { code: 'VRA', name: 'Aeropuerto Internacional Juan Gualberto Gómez', city: 'Varadero', country: 'Cuba', hasTerminals: false, terminals: [] },
  { code: 'SDQ', name: 'Aeropuerto Internacional Las Américas', city: 'Santo Domingo', country: 'República Dominicana', hasTerminals: false, terminals: [] },
  { code: 'PUJ', name: 'Aeropuerto Internacional de Punta Cana', city: 'Punta Cana', country: 'República Dominicana', hasTerminals: false, terminals: [] },
  { code: 'SJU', name: 'Aeropuerto Internacional Luis Muñoz Marín', city: 'San Juan', country: 'Puerto Rico', hasTerminals: true, terminals: ['A', 'B', 'C', 'D'] },
  { code: 'NAS', name: 'Aeropuerto Internacional Lynden Pindling', city: 'Nassau', country: 'Bahamas', hasTerminals: false, terminals: [] },
  { code: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', country: 'Jamaica', hasTerminals: false, terminals: [] },
  { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston', country: 'Jamaica', hasTerminals: false, terminals: [] },
  { code: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad', country: 'Aruba', hasTerminals: false, terminals: [] },
  { code: 'CUR', name: 'Curaçao International Airport', city: 'Willemstad', country: 'Curazao', hasTerminals: false, terminals: [] },
  { code: 'SXM', name: 'Princess Juliana International Airport', city: 'Sint Maarten', country: 'Sint Maarten', hasTerminals: false, terminals: [] },

  // ============================================
  // SUDAMÉRICA (PRINCIPALES)
  // ============================================
  { code: 'BOG', name: 'Aeropuerto Internacional El Dorado', city: 'Bogotá', country: 'Colombia', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'MDE', name: 'Aeropuerto Internacional José María Córdova', city: 'Medellín', country: 'Colombia', hasTerminals: false, terminals: [] },
  { code: 'CTG', name: 'Aeropuerto Internacional Rafael Núñez', city: 'Cartagena', country: 'Colombia', hasTerminals: false, terminals: [] },
  { code: 'CLO', name: 'Aeropuerto Internacional Alfonso Bonilla Aragón', city: 'Cali', country: 'Colombia', hasTerminals: false, terminals: [] },
  { code: 'LIM', name: 'Aeropuerto Internacional Jorge Chávez', city: 'Lima', country: 'Perú', hasTerminals: false, terminals: [] },
  { code: 'CUZ', name: 'Aeropuerto Internacional Alejandro Velasco Astete', city: 'Cusco', country: 'Perú', hasTerminals: false, terminals: [] },
  { code: 'UIO', name: 'Aeropuerto Internacional Mariscal Sucre', city: 'Quito', country: 'Ecuador', hasTerminals: false, terminals: [] },
  { code: 'GYE', name: 'Aeropuerto Internacional José Joaquín de Olmedo', city: 'Guayaquil', country: 'Ecuador', hasTerminals: false, terminals: [] },
  { code: 'CCS', name: 'Aeropuerto Internacional de Maiquetía Simón Bolívar', city: 'Caracas', country: 'Venezuela', hasTerminals: false, terminals: [] },
  { code: 'SCL', name: 'Aeropuerto Internacional Arturo Merino Benítez', city: 'Santiago', country: 'Chile', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'EZE', name: 'Aeropuerto Internacional Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', hasTerminals: true, terminals: ['A', 'B', 'C'] },
  { code: 'AEP', name: 'Aeroparque Jorge Newbery', city: 'Buenos Aires', country: 'Argentina', hasTerminals: false, terminals: [] },
  { code: 'GRU', name: 'Aeropuerto Internacional de São Paulo-Guarulhos', city: 'São Paulo', country: 'Brasil', hasTerminals: true, terminals: ['1', '2', '3'] },
  { code: 'GIG', name: 'Aeropuerto Internacional Tom Jobim', city: 'Río de Janeiro', country: 'Brasil', hasTerminals: true, terminals: ['1', '2'] },
  { code: 'BSB', name: 'Aeropuerto Internacional de Brasilia', city: 'Brasilia', country: 'Brasil', hasTerminals: false, terminals: [] },
  { code: 'MVD', name: 'Aeropuerto Internacional de Carrasco', city: 'Montevideo', country: 'Uruguay', hasTerminals: false, terminals: [] },
  { code: 'ASU', name: 'Aeropuerto Internacional Silvio Pettirossi', city: 'Asunción', country: 'Paraguay', hasTerminals: false, terminals: [] },
  { code: 'VVI', name: 'Aeropuerto Internacional Viru Viru', city: 'Santa Cruz', country: 'Bolivia', hasTerminals: false, terminals: [] },
  { code: 'LPB', name: 'Aeropuerto Internacional El Alto', city: 'La Paz', country: 'Bolivia', hasTerminals: false, terminals: [] },

  // ============================================
  // CANADÁ (PRINCIPALES)
  // ============================================
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canadá', hasTerminals: true, terminals: ['1', '3'] },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YWG', name: 'Winnipeg James Armstrong Richardson International Airport', city: 'Winnipeg', country: 'Canadá', hasTerminals: false, terminals: [] },
  { code: 'YHZ', name: 'Halifax Stanfield International Airport', city: 'Halifax', country: 'Canadá', hasTerminals: false, terminals: [] },
]

// Map for quick lookup by code
export const AIRPORT_MAP = new Map(AIRPORTS.map(a => [a.code, a]))

// Get airport by code
export function getAirport(code: string): Airport | undefined {
  return AIRPORT_MAP.get(code.toUpperCase())
}

// Search airports by query (code, city, name, or state)
export function searchAirports(query: string, limit = 15): Airport[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  // Prioritize exact code match
  const exactMatch = AIRPORTS.find(a => a.code.toLowerCase() === q)

  const matches = AIRPORTS
    .filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.state && a.state.toLowerCase().includes(q))
    )
    .sort((a, b) => {
      // Exact code match first
      if (a.code.toLowerCase() === q) return -1
      if (b.code.toLowerCase() === q) return 1
      // Code starts with query
      if (a.code.toLowerCase().startsWith(q)) return -1
      if (b.code.toLowerCase().startsWith(q)) return 1
      // City starts with query
      if (a.city.toLowerCase().startsWith(q)) return -1
      if (b.city.toLowerCase().startsWith(q)) return 1
      return 0
    })

  return matches.slice(0, limit)
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

// Create a custom airport from user input (for when airport is not in database)
export function createCustomAirport(code: string): Airport {
  return {
    code: code.toUpperCase(),
    name: `Aeropuerto ${code.toUpperCase()}`,
    city: code.toUpperCase(),
    country: 'Desconocido',
    hasTerminals: false,
    terminals: [],
  }
}
