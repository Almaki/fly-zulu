import { v4 as uuidv4 } from 'uuid'
import { getDB, initializeCurrentState } from './db'
import type { DutySession, FlightEntry, CurrentWorkState, SyncStatus } from './db'

// =====================
// DUTY SESSION OPERATIONS
// =====================

export async function createDutySession(
  userId: string,
  dutyStart: string
): Promise<DutySession> {
  const db = await getDB()
  const now = new Date().toISOString()
  const date = now.split('T')[0]

  const session: DutySession = {
    id: uuidv4(),
    userId,
    date,
    dutyStart,
    dutyEnd: null,
    dutyMinutes: null,
    status: 'active',
    flights: [],
    syncStatus: 'pending',
    localUpdatedAt: now,
    serverUpdatedAt: null,
  }

  await db.put('dutySessions', session)

  // Update current state
  await db.put('currentState', {
    ...(await initializeCurrentState()),
    dutySessionId: session.id,
  })

  return session
}

export async function getActiveDutySession(userId: string): Promise<DutySession | null> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('dutySessions', 'by-userId', userId)
  return sessions.find(s => s.status === 'active') || null
}

export async function getDutySessionById(id: string): Promise<DutySession | null> {
  const db = await getDB()
  const session = await db.get('dutySessions', id)
  return session ?? null
}

export async function getDutySessions(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<DutySession[]> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('dutySessions', 'by-userId', userId)

  // Sort by date descending
  sessions.sort((a, b) => b.date.localeCompare(a.date))

  const start = options?.offset || 0
  const end = options?.limit ? start + options.limit : undefined

  return sessions.slice(start, end)
}

export async function updateDutySession(
  id: string,
  updates: Partial<Omit<DutySession, 'id' | 'userId'>>
): Promise<DutySession | null> {
  const db = await getDB()
  const session = await db.get('dutySessions', id)

  if (!session) return null

  const updated: DutySession = {
    ...session,
    ...updates,
    syncStatus: 'pending',
    localUpdatedAt: new Date().toISOString(),
  }

  await db.put('dutySessions', updated)
  return updated
}

export async function completeDutySession(
  id: string,
  dutyEnd: string,
  dutyMinutes: number
): Promise<DutySession | null> {
  return updateDutySession(id, {
    dutyEnd,
    dutyMinutes,
    status: 'completed',
  })
}

// =====================
// FLIGHT OPERATIONS
// =====================

export async function createFlight(
  flight: Omit<FlightEntry, 'id' | 'syncStatus' | 'localUpdatedAt' | 'serverUpdatedAt'>
): Promise<FlightEntry> {
  const db = await getDB()
  const now = new Date().toISOString()

  const newFlight: FlightEntry = {
    ...flight,
    id: uuidv4(),
    syncStatus: 'pending',
    localUpdatedAt: now,
    serverUpdatedAt: null,
  }

  await db.put('flights', newFlight)

  // Add flight to duty session
  const session = await db.get('dutySessions', flight.dutySessionId)
  if (session) {
    session.flights.push(newFlight.id)
    session.syncStatus = 'pending'
    session.localUpdatedAt = now
    await db.put('dutySessions', session)
  }

  // Update current state
  const currentState = await initializeCurrentState()
  await db.put('currentState', {
    ...currentState,
    currentFlight: null,
    lastAirport: flight.dest,
    lastTail: flight.tail,
    lastAircraftType: flight.aircraftType,
  })

  return newFlight
}

export async function getFlightById(id: string): Promise<FlightEntry | null> {
  const db = await getDB()
  const flight = await db.get('flights', id)
  return flight ?? null
}

export async function getFlightsByDutySession(dutySessionId: string): Promise<FlightEntry[]> {
  const db = await getDB()
  const flights = await db.getAllFromIndex('flights', 'by-dutySessionId', dutySessionId)

  // Sort by outTime ascending
  flights.sort((a, b) => a.outTime.localeCompare(b.outTime))

  return flights
}

export async function getFlightsByUser(
  userId: string,
  options?: { limit?: number; offset?: number; date?: string }
): Promise<FlightEntry[]> {
  const db = await getDB()
  let flights: FlightEntry[]

  if (options?.date) {
    flights = await db.getAllFromIndex('flights', 'by-date', options.date)
    flights = flights.filter(f => f.userId === userId)
  } else {
    flights = await db.getAllFromIndex('flights', 'by-userId', userId)
  }

  // Sort by date and outTime descending
  flights.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.outTime.localeCompare(a.outTime)
  })

  const start = options?.offset || 0
  const end = options?.limit ? start + options.limit : undefined

  return flights.slice(start, end)
}

export async function updateFlight(
  id: string,
  updates: Partial<Omit<FlightEntry, 'id' | 'userId' | 'dutySessionId'>>
): Promise<FlightEntry | null> {
  const db = await getDB()
  const flight = await db.get('flights', id)

  if (!flight) return null

  const updated: FlightEntry = {
    ...flight,
    ...updates,
    syncStatus: 'pending',
    localUpdatedAt: new Date().toISOString(),
  }

  await db.put('flights', updated)
  return updated
}

// =====================
// CURRENT STATE OPERATIONS
// =====================

export async function getCurrentState(): Promise<CurrentWorkState> {
  return initializeCurrentState()
}

export async function updateCurrentState(
  updates: Partial<Omit<CurrentWorkState, 'id'>>
): Promise<CurrentWorkState> {
  const db = await getDB()
  const current = await initializeCurrentState()

  const updated: CurrentWorkState = {
    ...current,
    ...updates,
  }

  await db.put('currentState', updated)
  return updated
}

export async function saveCurrentFlightProgress(
  flightData: Partial<FlightEntry>
): Promise<void> {
  await updateCurrentState({ currentFlight: flightData })
}

export async function clearCurrentFlight(): Promise<void> {
  await updateCurrentState({ currentFlight: null })
}

// =====================
// PENDING SYNC OPERATIONS
// =====================

export async function getPendingDutySessions(): Promise<DutySession[]> {
  const db = await getDB()
  return db.getAllFromIndex('dutySessions', 'by-syncStatus', 'pending')
}

export async function getPendingFlights(): Promise<FlightEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('flights', 'by-syncStatus', 'pending')
}

export async function getPendingCount(): Promise<number> {
  const [sessions, flights] = await Promise.all([
    getPendingDutySessions(),
    getPendingFlights(),
  ])
  return sessions.length + flights.length
}

export async function markAsSynced(
  type: 'dutySessions' | 'flights',
  id: string,
  serverUpdatedAt: string
): Promise<void> {
  const db = await getDB()

  if (type === 'dutySessions') {
    const session = await db.get('dutySessions', id)
    if (session) {
      session.syncStatus = 'synced'
      session.serverUpdatedAt = serverUpdatedAt
      await db.put('dutySessions', session)
    }
  } else {
    const flight = await db.get('flights', id)
    if (flight) {
      flight.syncStatus = 'synced'
      flight.serverUpdatedAt = serverUpdatedAt
      await db.put('flights', flight)
    }
  }
}

export async function markAsSyncError(
  type: 'dutySessions' | 'flights',
  id: string
): Promise<void> {
  const db = await getDB()

  if (type === 'dutySessions') {
    const session = await db.get('dutySessions', id)
    if (session) {
      session.syncStatus = 'error'
      await db.put('dutySessions', session)
    }
  } else {
    const flight = await db.get('flights', id)
    if (flight) {
      flight.syncStatus = 'error'
      await db.put('flights', flight)
    }
  }
}

// =====================
// HISTORY OPERATIONS (Last 48 hours local, forever on server)
// =====================

const LOCAL_RETENTION_HOURS = 48

/**
 * Get all duty sessions with their flights for history view
 * Returns data from the last 48 hours stored locally
 */
export async function getLocalHistory(userId: string): Promise<{
  sessions: (DutySession & { flightEntries: FlightEntry[] })[]
  oldestDate: string | null
}> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('dutySessions', 'by-userId', userId)

  // Get all flights for these sessions
  const sessionsWithFlights = await Promise.all(
    sessions.map(async (session) => {
      const flightEntries = await getFlightsByDutySession(session.id)
      return { ...session, flightEntries }
    })
  )

  // Sort by date descending
  sessionsWithFlights.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare
    return b.dutyStart.localeCompare(a.dutyStart)
  })

  const oldestDate = sessions.length > 0
    ? sessions.reduce((oldest, s) => s.date < oldest ? s.date : oldest, sessions[0].date)
    : null

  return { sessions: sessionsWithFlights, oldestDate }
}

/**
 * Clean up local data older than 48 hours
 * Only removes data that has been synced to the server
 */
export async function cleanupOldLocalData(): Promise<{
  deletedSessions: number
  deletedFlights: number
}> {
  const db = await getDB()
  const cutoffDate = new Date(Date.now() - LOCAL_RETENTION_HOURS * 60 * 60 * 1000)
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

  let deletedSessions = 0
  let deletedFlights = 0

  // Get all sessions
  const allSessions = await db.getAll('dutySessions')

  for (const session of allSessions) {
    // Only delete if:
    // 1. Session date is older than cutoff
    // 2. Session has been synced to server
    // 3. Session is completed (not active)
    if (
      session.date < cutoffDateStr &&
      session.syncStatus === 'synced' &&
      session.status === 'completed'
    ) {
      // Delete associated flights first
      const flights = await getFlightsByDutySession(session.id)
      for (const flight of flights) {
        if (flight.syncStatus === 'synced') {
          await db.delete('flights', flight.id)
          deletedFlights++
        }
      }

      // Then delete the session
      await db.delete('dutySessions', session.id)
      deletedSessions++
    }
  }

  console.log(`Cleanup completed: ${deletedSessions} sessions, ${deletedFlights} flights removed`)
  return { deletedSessions, deletedFlights }
}

/**
 * Get summary statistics from local data
 */
export async function getLocalStats(userId: string): Promise<{
  totalFlights: number
  totalFlightMinutes: number
  totalBlockMinutes: number
  totalDutySessions: number
  averageDutyMinutes: number
}> {
  const db = await getDB()

  const sessions = await db.getAllFromIndex('dutySessions', 'by-userId', userId)
  const flights = await db.getAllFromIndex('flights', 'by-userId', userId)

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.dutyMinutes)
  const totalDutyMinutes = completedSessions.reduce((sum, s) => sum + (s.dutyMinutes || 0), 0)

  return {
    totalFlights: flights.length,
    totalFlightMinutes: flights.reduce((sum, f) => sum + f.flightMinutes, 0),
    totalBlockMinutes: flights.reduce((sum, f) => sum + f.blockMinutes, 0),
    totalDutySessions: sessions.length,
    averageDutyMinutes: completedSessions.length > 0
      ? Math.round(totalDutyMinutes / completedSessions.length)
      : 0,
  }
}
