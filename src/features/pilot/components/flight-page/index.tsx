'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { FlightHeader } from './flight-header'
import { DutySection } from './duty-section'
import { MCDUSection, type MCDUFormData } from './mcdu-section'
import { FlightSummary } from './flight-summary'
import { EndFlightDialog } from './end-flight-dialog'
import { HistorySection } from './history-section'
import { useAuthStore } from '@/features/auth/store'
import {
  createDutySession,
  getActiveDutySession,
  completeDutySession,
  updateDutySession,
  createFlight,
  updateFlight,
  getFlightsByDutySession,
  getCurrentState,
  updateCurrentState,
  saveCurrentFlightProgress,
  clearCurrentFlight,
  setupSyncListeners,
  type DutySession,
  type FlightEntry,
} from '@/shared/lib/offline'
import {
  calculateMinutesBetween,
  formatDurationHHMM,
  calculateDutyEnd,
  getCurrentZuluDate,
} from '@/shared/lib/time'

// Generate a temporary user ID for offline/anonymous use
const ANONYMOUS_USER_ID = 'anonymous-pilot'

export function FlightPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAirport, setSelectedAirport] = useState('MEX')

  // Use real user ID or anonymous ID for offline functionality
  const effectiveUserId = user?.id || ANONYMOUS_USER_ID

  // Duty state
  const [dutySession, setDutySession] = useState<DutySession | null>(null)
  const [flights, setFlights] = useState<FlightEntry[]>([])

  // Current flight state
  const [lastDest, setLastDest] = useState<string | undefined>()
  const [lastTail, setLastTail] = useState<string | undefined>()
  const [lastAircraftType, setLastAircraftType] = useState<string | undefined>()
  const [currentFlightData, setCurrentFlightData] = useState<Partial<MCDUFormData> | null>(null)

  // Dialog state
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [completedFlightSummary, setCompletedFlightSummary] = useState<{
    dep: string
    dest: string
    flightTime: string
    blockTime: string
    data: MCDUFormData
  } | null>(null)

  // Edit flight state
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Get current state (last airport, tail, etc.) - works offline
        const state = await getCurrentState()
        setLastDest(state.lastAirport || undefined)
        setLastTail(state.lastTail || undefined)
        setLastAircraftType(state.lastAircraftType || undefined)

        // Restore current flight progress if any
        if (state.currentFlight) {
          setCurrentFlightData(state.currentFlight as Partial<MCDUFormData>)
        }

        // Load duty session (works with real user or anonymous)
        const session = await getActiveDutySession(effectiveUserId)
        setDutySession(session)

        // Get flights for session
        if (session) {
          const sessionFlights = await getFlightsByDutySession(session.id)
          setFlights(sessionFlights)
        }
      } catch (error) {
        console.error('Error loading flight data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Setup sync listeners
    const cleanup = setupSyncListeners()
    return cleanup
  }, [effectiveUserId])

  // Handle duty start
  const handleStartDuty = async (time: string) => {
    try {
      const session = await createDutySession(effectiveUserId, time)
      setDutySession(session)
      toast.success('Jornada iniciada')
    } catch (error) {
      console.error('Error starting duty:', error)
      toast.error('Error al iniciar jornada')
    }
  }

  // Handle duty start update (edit existing start time)
  const handleUpdateDutyStart = async (time: string) => {
    if (!dutySession) return

    try {
      await updateDutySession(dutySession.id, { dutyStart: time })
      setDutySession({
        ...dutySession,
        dutyStart: time,
      })
      toast.success('Inicio de jornada actualizado')
    } catch (error) {
      console.error('Error updating duty start:', error)
      toast.error('Error al actualizar inicio')
    }
  }

  // Handle duty end
  const handleEndDuty = async (time: string) => {
    if (!dutySession) return

    try {
      const dutyMinutes = calculateMinutesBetween(dutySession.dutyStart, time)
      await completeDutySession(dutySession.id, time, dutyMinutes)
      setDutySession({
        ...dutySession,
        dutyEnd: time,
        dutyMinutes,
        status: 'completed',
      })
      toast.success('Jornada finalizada')
    } catch (error) {
      console.error('Error ending duty:', error)
      toast.error('Error al finalizar jornada')
    }
  }

  // Handle form changes (save progress)
  const handleFormChange = useCallback(async (data: Partial<MCDUFormData>) => {
    setCurrentFlightData(data)
    await saveCurrentFlightProgress(data as Partial<FlightEntry>)
  }, [])

  // Handle save edited flight
  const handleSaveEditedFlight = useCallback(async (data: MCDUFormData) => {
    if (!editingFlightId) return

    try {
      const flightMinutes = calculateMinutesBetween(data.offTime!, data.onTime!)
      const blockMinutes = calculateMinutesBetween(data.outTime!, data.inTime!)

      await updateFlight(editingFlightId, {
        date: data.date,
        tail: data.tail,
        aircraftType: data.aircraftType,
        dep: data.dep,
        dest: data.dest,
        outTime: data.outTime!,
        offTime: data.offTime!,
        onTime: data.onTime!,
        inTime: data.inTime!,
        flightMinutes,
        blockMinutes,
      })

      // Update flights list
      setFlights(prev =>
        prev.map(f =>
          f.id === editingFlightId
            ? {
                ...f,
                date: data.date,
                tail: data.tail,
                aircraftType: data.aircraftType,
                dep: data.dep,
                dest: data.dest,
                outTime: data.outTime!,
                offTime: data.offTime!,
                onTime: data.onTime!,
                inTime: data.inTime!,
                flightMinutes,
                blockMinutes,
              }
            : f
        )
      )

      // Clear edit mode
      setEditingFlightId(null)
      setCurrentFlightData(null)
      await clearCurrentFlight()

      toast.success('Vuelo actualizado')
    } catch (error) {
      console.error('Error updating flight:', error)
      toast.error('Error al actualizar vuelo')
    }
  }, [editingFlightId])

  // Handle flight complete (all 4 times entered)
  const handleFlightComplete = useCallback((data: MCDUFormData) => {
    if (!data.outTime || !data.offTime || !data.onTime || !data.inTime) return

    // If editing, save directly without dialog
    if (editingFlightId) {
      handleSaveEditedFlight(data)
      return
    }

    const flightMinutes = calculateMinutesBetween(data.offTime, data.onTime)
    const blockMinutes = calculateMinutesBetween(data.outTime, data.inTime)

    setCompletedFlightSummary({
      dep: data.dep,
      dest: data.dest,
      flightTime: formatDurationHHMM(flightMinutes),
      blockTime: formatDurationHHMM(blockMinutes),
      data,
    })
    setShowEndDialog(true)
  }, [editingFlightId, handleSaveEditedFlight])

  // Handle add another flight
  const handleAddAnother = async () => {
    if (!completedFlightSummary || !dutySession) return

    try {
      const data = completedFlightSummary.data
      const flightMinutes = calculateMinutesBetween(data.offTime!, data.onTime!)
      const blockMinutes = calculateMinutesBetween(data.outTime!, data.inTime!)

      // Save flight to IndexedDB
      const newFlight = await createFlight({
        dutySessionId: dutySession.id,
        userId: effectiveUserId,
        date: data.date,
        tail: data.tail,
        aircraftType: data.aircraftType,
        dep: data.dep,
        dest: data.dest,
        outTime: data.outTime!,
        offTime: data.offTime!,
        onTime: data.onTime!,
        inTime: data.inTime!,
        flightMinutes,
        blockMinutes,
        notes: null,
      })

      // Update state
      setFlights([...flights, newFlight])
      setLastDest(data.dest)
      setLastTail(data.tail)
      setLastAircraftType(data.aircraftType)

      // Clear current flight and reset form
      await clearCurrentFlight()
      setCurrentFlightData(null)
      setCompletedFlightSummary(null)
      setShowEndDialog(false)

      toast.success('Vuelo guardado')
    } catch (error) {
      console.error('Error saving flight:', error)
      toast.error('Error al guardar vuelo')
    }
  }

  // Handle end day
  const handleEndDay = async () => {
    if (!completedFlightSummary || !dutySession) return

    try {
      // First save the flight
      const data = completedFlightSummary.data
      const flightMinutes = calculateMinutesBetween(data.offTime!, data.onTime!)
      const blockMinutes = calculateMinutesBetween(data.outTime!, data.inTime!)

      await createFlight({
        dutySessionId: dutySession.id,
        userId: effectiveUserId,
        date: data.date,
        tail: data.tail,
        aircraftType: data.aircraftType,
        dep: data.dep,
        dest: data.dest,
        outTime: data.outTime!,
        offTime: data.offTime!,
        onTime: data.onTime!,
        inTime: data.inTime!,
        flightMinutes,
        blockMinutes,
        notes: null,
      })

      // Then end duty
      const dutyEndTime = calculateDutyEnd(data.inTime!)
      const dutyMinutes = calculateMinutesBetween(dutySession.dutyStart, dutyEndTime)
      await completeDutySession(dutySession.id, dutyEndTime, dutyMinutes)

      // Clear state
      await clearCurrentFlight()
      setCurrentFlightData(null)
      setCompletedFlightSummary(null)
      setShowEndDialog(false)
      setDutySession(null)
      setFlights([])

      toast.success('Día finalizado. Datos guardados.')
    } catch (error) {
      console.error('Error ending day:', error)
      toast.error('Error al finalizar día')
    }
  }

  // Handle edit flight from history
  const handleEditFlight = useCallback((flight: FlightEntry) => {
    setEditingFlightId(flight.id)
    setCurrentFlightData({
      date: flight.date,
      tail: flight.tail,
      aircraftType: flight.aircraftType,
      dep: flight.dep,
      dest: flight.dest,
      outTime: flight.outTime,
      offTime: flight.offTime,
      onTime: flight.onTime,
      inTime: flight.inTime,
    })
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingFlightId(null)
    setCurrentFlightData(null)
    clearCurrentFlight()
  }, [])

  // Get last IN time for duty end calculation
  const lastInTime = flights.length > 0
    ? flights[flights.length - 1].inTime
    : currentFlightData?.inTime || null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffff]" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header with ZULU time */}
      <FlightHeader
        selectedAirport={selectedAirport}
        onAirportChange={setSelectedAirport}
      />

      {/* Duty Section */}
      <DutySection
        dutyStart={dutySession?.dutyStart || null}
        dutyEnd={dutySession?.dutyEnd || null}
        lastInTime={lastInTime}
        onStartDuty={handleStartDuty}
        onEndDuty={handleEndDuty}
        onUpdateDutyStart={handleUpdateDutyStart}
        onUpdateDutyEnd={() => {}}
      />

      {/* MCDU Section */}
      <MCDUSection
        initialData={currentFlightData || undefined}
        lastDest={lastDest}
        lastTail={lastTail}
        lastAircraftType={lastAircraftType}
        editingFlightId={editingFlightId}
        onFormChange={handleFormChange}
        onFlightComplete={handleFlightComplete}
        onCancelEdit={handleCancelEdit}
      />

      {/* Flight Summary */}
      <FlightSummary flights={flights} />

      {/* History Section (48h local, forever on server) */}
      <HistorySection userId={effectiveUserId} onEditFlight={handleEditFlight} />

      {/* End Flight Dialog */}
      {completedFlightSummary && (
        <EndFlightDialog
          open={showEndDialog}
          onOpenChange={setShowEndDialog}
          flightSummary={completedFlightSummary}
          onAddAnother={handleAddAnother}
          onEndDay={handleEndDay}
        />
      )}
    </div>
  )
}
