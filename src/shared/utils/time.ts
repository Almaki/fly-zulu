export function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
