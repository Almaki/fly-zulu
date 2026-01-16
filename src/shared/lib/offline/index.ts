// Database
export {
  getDB,
  initializeCurrentState,
  closeDB,
  type SyncStatus,
  type DutySession,
  type FlightEntry,
  type CurrentWorkState,
} from './db'

// Operations
export {
  // Duty sessions
  createDutySession,
  getActiveDutySession,
  getDutySessionById,
  getDutySessions,
  updateDutySession,
  completeDutySession,
  // Flights
  createFlight,
  getFlightById,
  getFlightsByDutySession,
  getFlightsByUser,
  updateFlight,
  // Current state
  getCurrentState,
  updateCurrentState,
  saveCurrentFlightProgress,
  clearCurrentFlight,
  // Pending sync
  getPendingDutySessions,
  getPendingFlights,
  getPendingCount,
  markAsSynced,
  markAsSyncError,
  // History (48h local retention)
  getLocalHistory,
  cleanupOldLocalData,
  getLocalStats,
} from './operations'

// Sync
export {
  syncPendingRecords,
  addSyncListener,
  setupSyncListeners,
  registerBackgroundSync,
} from './sync'
