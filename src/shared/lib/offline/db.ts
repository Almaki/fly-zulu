import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Sync status types
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error'

// Duty session interface
export interface DutySession {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  dutyStart: string // HH:MM ZULU
  dutyEnd: string | null // HH:MM ZULU
  dutyMinutes: number | null
  status: 'active' | 'completed'
  flights: string[] // Flight IDs
  syncStatus: SyncStatus
  localUpdatedAt: string
  serverUpdatedAt: string | null
}

// Flight entry interface
export interface FlightEntry {
  id: string
  dutySessionId: string
  userId: string
  date: string // YYYY-MM-DD (can differ from session if overnight)
  tail: string
  aircraftType: string
  dep: string
  dest: string
  outTime: string // HH:MM ZULU
  offTime: string // HH:MM ZULU
  onTime: string // HH:MM ZULU
  inTime: string // HH:MM ZULU
  flightMinutes: number // ON - OFF
  blockMinutes: number // IN - OUT
  notes: string | null
  syncStatus: SyncStatus
  localUpdatedAt: string
  serverUpdatedAt: string | null
}

// Current work state (singleton)
export interface CurrentWorkState {
  id: 'current'
  dutySessionId: string | null
  currentFlight: Partial<FlightEntry> | null
  lastAirport: string | null
  lastTail: string | null
  lastAircraftType: string | null
}

// Database schema
interface FlyZuluPilotDB extends DBSchema {
  dutySessions: {
    key: string
    value: DutySession
    indexes: {
      'by-userId': string
      'by-date': string
      'by-status': 'active' | 'completed'
      'by-syncStatus': SyncStatus
    }
  }
  flights: {
    key: string
    value: FlightEntry
    indexes: {
      'by-dutySessionId': string
      'by-userId': string
      'by-date': string
      'by-syncStatus': SyncStatus
    }
  }
  currentState: {
    key: 'current'
    value: CurrentWorkState
  }
}

const DB_NAME = 'fly-zulu-pilot-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<FlyZuluPilotDB> | null = null

export async function getDB(): Promise<IDBPDatabase<FlyZuluPilotDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<FlyZuluPilotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Duty sessions store
      if (!db.objectStoreNames.contains('dutySessions')) {
        const dutyStore = db.createObjectStore('dutySessions', { keyPath: 'id' })
        dutyStore.createIndex('by-userId', 'userId')
        dutyStore.createIndex('by-date', 'date')
        dutyStore.createIndex('by-status', 'status')
        dutyStore.createIndex('by-syncStatus', 'syncStatus')
      }

      // Flights store
      if (!db.objectStoreNames.contains('flights')) {
        const flightsStore = db.createObjectStore('flights', { keyPath: 'id' })
        flightsStore.createIndex('by-dutySessionId', 'dutySessionId')
        flightsStore.createIndex('by-userId', 'userId')
        flightsStore.createIndex('by-date', 'date')
        flightsStore.createIndex('by-syncStatus', 'syncStatus')
      }

      // Current state store (singleton)
      if (!db.objectStoreNames.contains('currentState')) {
        db.createObjectStore('currentState', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

// Initialize current state if not exists
export async function initializeCurrentState(): Promise<CurrentWorkState> {
  const db = await getDB()
  let state = await db.get('currentState', 'current')

  if (!state) {
    state = {
      id: 'current',
      dutySessionId: null,
      currentFlight: null,
      lastAirport: null,
      lastTail: null,
      lastAircraftType: null,
    }
    await db.put('currentState', state)
  }

  return state
}

// Close database connection
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
