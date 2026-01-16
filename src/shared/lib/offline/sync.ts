import { createClient } from '@/shared/lib/supabase/client'
import {
  getPendingDutySessions,
  getPendingFlights,
  markAsSynced,
  markAsSyncError,
  getPendingCount,
} from './operations'
import type { DutySession, FlightEntry } from './db'

// Sync state management
let isSyncing = false
let syncListeners: ((syncing: boolean, pending: number) => void)[] = []

export function addSyncListener(
  listener: (syncing: boolean, pending: number) => void
): () => void {
  syncListeners.push(listener)
  return () => {
    syncListeners = syncListeners.filter(l => l !== listener)
  }
}

function notifySyncListeners(syncing: boolean, pending: number): void {
  syncListeners.forEach(listener => listener(syncing, pending))
}

// Main sync function
export async function syncPendingRecords(): Promise<void> {
  if (isSyncing) return
  if (!navigator.onLine) return

  isSyncing = true
  const pendingCount = await getPendingCount()
  notifySyncListeners(true, pendingCount)

  try {
    // Sync duty sessions first (parent records)
    const pendingSessions = await getPendingDutySessions()
    for (const session of pendingSessions) {
      await syncDutySession(session)
    }

    // Then sync flights (child records)
    const pendingFlights = await getPendingFlights()
    for (const flight of pendingFlights) {
      await syncFlight(flight)
    }
  } catch (error) {
    console.error('Sync error:', error)
  } finally {
    isSyncing = false
    const remaining = await getPendingCount()
    notifySyncListeners(false, remaining)
  }
}

async function syncDutySession(session: DutySession): Promise<void> {
  const supabase = createClient()

  // Skip anonymous users for server sync (they work offline-only)
  if (session.userId === 'anonymous-pilot') {
    await markAsSynced('dutySessions', session.id, new Date().toISOString())
    return
  }

  try {
    // Check if exists on server by local_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('duty_sessions')
      .select('id, updated_at')
      .eq('local_id', session.id)
      .single() as { data: { id: string; updated_at: string } | null }

    const sessionData = {
      user_id: session.userId,
      local_id: session.id,
      date: session.date,
      duty_start: session.dutyStart,
      duty_end: session.dutyEnd,
      duty_minutes: session.dutyMinutes,
      status: session.status,
      flights_count: session.flights.length,
      sync_status: 'synced',
    }

    if (existing) {
      // Update existing - Last Write Wins
      const serverDate = new Date(existing.updated_at || 0)
      const localDate = new Date(session.localUpdatedAt)

      if (localDate > serverDate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('duty_sessions') as any)
          .update({
            ...sessionData,
            updated_at: session.localUpdatedAt,
          })
          .eq('id', existing.id)
      }
    } else {
      // Insert new duty session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('duty_sessions') as any).insert(sessionData)
    }

    await markAsSynced('dutySessions', session.id, new Date().toISOString())
  } catch (error) {
    console.error('Error syncing duty session:', error)
    await markAsSyncError('dutySessions', session.id)
  }
}

async function syncFlight(flight: FlightEntry): Promise<void> {
  const supabase = createClient()

  // Skip anonymous users for server sync (they work offline-only)
  if (flight.userId === 'anonymous-pilot') {
    await markAsSynced('flights', flight.id, new Date().toISOString())
    return
  }

  try {
    // Check if exists on server by local_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('pilot_logs')
      .select('id, updated_at')
      .eq('local_id', flight.id)
      .single() as { data: { id: string; updated_at: string } | null }

    const flightData = {
      user_id: flight.userId,
      local_id: flight.id,
      date: flight.date,
      tail: flight.tail,
      aircraft_type: flight.aircraftType,
      dep: flight.dep,
      dest: flight.dest,
      out_time: flight.outTime,
      off_time: flight.offTime,
      on_time: flight.onTime,
      in_time: flight.inTime,
      flight_time_minutes: flight.flightMinutes,
      block_time_minutes: flight.blockMinutes,
      notes: flight.notes,
      sync_status: 'synced',
    }

    if (existing) {
      // Update existing - Last Write Wins
      const serverDate = new Date(existing.updated_at || 0)
      const localDate = new Date(flight.localUpdatedAt)

      if (localDate > serverDate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('pilot_logs') as any)
          .update({
            ...flightData,
            updated_at: flight.localUpdatedAt,
          })
          .eq('id', existing.id)
      }
    } else {
      // Insert new flight log
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('pilot_logs') as any).insert(flightData)
    }

    await markAsSynced('flights', flight.id, new Date().toISOString())
  } catch (error) {
    console.error('Error syncing flight:', error)
    await markAsSyncError('flights', flight.id)
  }
}

// Setup online/offline listeners
export function setupSyncListeners(): () => void {
  const handleOnline = () => {
    console.log('Online - triggering sync')
    syncPendingRecords()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      syncPendingRecords()
    }
  }

  window.addEventListener('online', handleOnline)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Initial sync if online
  if (navigator.onLine) {
    syncPendingRecords()
  }

  return () => {
    window.removeEventListener('online', handleOnline)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

// Background sync registration (for supported browsers)
export async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-expect-error - SyncManager types not fully available
      await registration.sync.register('sync-pilot-data')
      console.log('Background sync registered')
    } catch (error) {
      console.log('Background sync not supported:', error)
    }
  }
}
