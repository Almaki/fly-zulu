// Colors from design system
export const COLORS = {
  // Base
  bgDark: '#0a0a0a',
  surface: '#141414',
  text: '#fafafa',
  textMuted: '#71717a',

  // MCDU
  mcduGreen: '#00ff41',
  mcduCyan: '#00ffff',
  mcduAmber: '#ffbf00',

  // Accent
  accent: '#00ff88',

  // Airlines
  volaris: '#E91E8C',
  viva: '#39FF14',
  aeromexico: '#E31837',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  // WhatsApp
  whatsapp: '#25D366',

  // Flight status
  onTime: '#fafafa',
  delay: '#FF9500',
  gateChange: '#007AFF',
  canceled: '#FF3B30',
} as const;

// Mexico timezones
export const MEXICO_TIMEZONES = {
  MEX: 'America/Mexico_City',
  GDL: 'America/Mexico_City',
  PVR: 'America/Mexico_City',
  MID: 'America/Mexico_City',
  CUN: 'America/Cancun',
  TIJ: 'America/Tijuana',
  HMO: 'America/Hermosillo',
} as const;

// Standard passenger weights (kg)
export const PAX_WEIGHTS = {
  H: 89,  // Hombre
  M: 81,  // Mujer
  Med: 33, // Medio (niño)
} as const;

// Special passenger codes
export const SPECIAL_PAX_CODES = [
  'WCHR', // Wheelchair - can walk short distances
  'WCHC', // Wheelchair - cannot walk
  'WCHS', // Wheelchair - cannot climb stairs
  'UMNR', // Unaccompanied minor
  'DEAF', // Deaf passenger
  'BLND', // Blind passenger
  'MAAS', // Meet and assist
  'DPNA', // Disabled passenger needing assistance
  'MEDA', // Medical case
  'OXYG', // Oxygen required
  'STCR', // Stretcher
  'EXST', // Extra seat
] as const;

// Directory categories
export const DIRECTORY_CATEGORIES = [
  { id: 'radial', label: 'Radial', emoji: '🍽️' },
  { id: 'airport', label: 'Aeropuerto', emoji: '✈️' },
  { id: 'taxi', label: 'Taxi/Uber', emoji: '🚕' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
] as const;

// FIDS retention window
export const FIDS_RETENTION = {
  PAST_MINUTES: 30,  // Vuelos desaparecen 30 min después de hora programada
  FUTURE_HOURS: 24,
  ARCHIVE_INTERVAL_MINUTES: 15,
} as const;

// Subscription pricing (MXN)
export const SUBSCRIPTION = {
  PREMIUM_PRICE_MXN: 149,
  FREE_FLASHCARDS_PER_DAY: 5,
} as const;

// Strike system
export const STRIKES = {
  WARNING: 1,
  RESTRICTION_24H: 2,
  PERMANENT_BAN: 3,
} as const;

// Duty time limits (hours)
export const DUTY_LIMITS = {
  MAX_DUTY_HOURS: 14,
  WARNING_THRESHOLD_HOURS: 12,
} as const;

// Re-export airports
export * from './airports'

// Routes by role
export const ROLE_ROUTES = {
  PILOT: ['/pilot/mcdu', '/pilot/duty', '/pilot/academy', '/pilot/copilot', '/pilot/crewmind'],
  FA: ['/fa/vuelo', '/fa/seguridad', '/fa/pax', '/fa/catering', '/fa/incidentes'],
  OPS: ['/ops/control', '/ops/walkaround', '/ops/gpu', '/ops/responsabilidad'],
  TRAFICO: ['/trafico/tiempos', '/trafico/especiales', '/trafico/seatmap'],
  MANTTO: ['/mantto/transit', '/mantto/certificacion'],
  SUPERADMIN: ['/admin/users', '/admin/metrics', '/admin/avisos', '/admin/fids', '/admin/activity'],
} as const;

// Shared routes
export const SHARED_ROUTES = {
  ALL: ['/board', '/profile'],
  FLIGHT_ONLY: ['/directory'],
} as const;
