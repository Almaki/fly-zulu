export {
  // Timezone data
  AIRPORT_TIMEZONES,
  // Time conversions
  timeToMinutes,
  minutesToTime,
  calculateMinutesBetween,
  calculateDutyEnd,
  // Duty status
  getDutyStatus,
  getDutyStatusColor,
  type DutyStatus,
  // Date detection
  detectTimeDate,
  // Validation
  validateFlightTimes,
  // Current time
  getCurrentZuluTime,
  getCurrentZuluDate,
  getAirportLocalTime,
  // Formatting
  formatDuration,
  formatDurationHHMM,
  // Helpers
  suggestItineraryTime,
} from './utils'
