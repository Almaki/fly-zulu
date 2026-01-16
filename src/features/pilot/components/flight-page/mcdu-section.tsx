'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plane } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form'
import {
  calculateMinutesBetween,
  formatDurationHHMM,
  getCurrentZuluDate,
} from '@/shared/lib/time'

const AIRCRAFT_TYPES = [
  'A319',
  'A320',
  'A321',
  'A330',
  'A350',
  'A380',
] as const

const mcduSchema = z.object({
  date: z.string(),
  tail: z.string().min(1, 'Matrícula requerida').max(10),
  aircraftType: z.string().min(1, 'Tipo requerido'),
  dep: z.string().length(3, 'Código IATA'),
  dest: z.string().length(3, 'Código IATA'),
  outTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  offTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  onTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  inTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
})

export type MCDUFormData = z.infer<typeof mcduSchema>

interface MCDUSectionProps {
  initialData?: Partial<MCDUFormData>
  lastDest?: string
  lastTail?: string
  lastAircraftType?: string
  onFormChange: (data: Partial<MCDUFormData>) => void
  onFlightComplete: (data: MCDUFormData) => void
}

export function MCDUSection({
  initialData,
  lastDest,
  lastTail,
  lastAircraftType,
  onFormChange,
  onFlightComplete,
}: MCDUSectionProps) {
  const [flightTime, setFlightTime] = useState<string | null>(null)
  const [blockTime, setBlockTime] = useState<string | null>(null)

  const form = useForm<MCDUFormData>({
    resolver: zodResolver(mcduSchema),
    defaultValues: {
      date: initialData?.date || getCurrentZuluDate(),
      tail: initialData?.tail || lastTail || '',
      aircraftType: initialData?.aircraftType || lastAircraftType || '',
      dep: initialData?.dep || lastDest || '',
      dest: initialData?.dest || '',
      outTime: initialData?.outTime || '',
      offTime: initialData?.offTime || '',
      onTime: initialData?.onTime || '',
      inTime: initialData?.inTime || '',
    },
  })

  // Track previous values to prevent infinite loops
  const prevValuesRef = useRef<string>('')
  const hasNotifiedComplete = useRef(false)

  // Memoize callbacks
  const stableOnFormChange = useCallback(onFormChange, [])
  const stableOnFlightComplete = useCallback(onFlightComplete, [])

  // Subscribe to form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentValues = JSON.stringify(values)

      // Only process if values actually changed
      if (currentValues === prevValuesRef.current) return
      prevValuesRef.current = currentValues

      // Flight time = ON - OFF
      if (values.offTime && values.onTime) {
        const mins = calculateMinutesBetween(values.offTime, values.onTime)
        setFlightTime(formatDurationHHMM(mins))
      } else {
        setFlightTime(null)
      }

      // Block time = IN - OUT
      if (values.outTime && values.inTime) {
        const mins = calculateMinutesBetween(values.outTime, values.inTime)
        setBlockTime(formatDurationHHMM(mins))
      } else {
        setBlockTime(null)
      }

      // Notify parent of changes
      stableOnFormChange(values as Partial<MCDUFormData>)

      // Check if flight is complete (only notify once per complete set)
      const isComplete = values.outTime && values.offTime && values.onTime && values.inTime &&
                         values.tail && values.aircraftType && values.dep && values.dest

      if (isComplete && !hasNotifiedComplete.current) {
        hasNotifiedComplete.current = true
        stableOnFlightComplete(values as MCDUFormData)
      } else if (!isComplete) {
        hasNotifiedComplete.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [form, stableOnFormChange, stableOnFlightComplete])

  // Auto-format time inputs
  const handleTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    let val = e.target.value.replace(/[^0-9]/g, '')

    if (val.length >= 2) {
      const hours = parseInt(val.slice(0, 2))
      if (hours > 23) val = '23' + val.slice(2)
      val = val.slice(0, 2) + ':' + val.slice(2)
    }
    if (val.length > 5) val = val.slice(0, 5)

    onChange(val)
  }

  return (
    <div className="bg-[#0a0a0a] border-2 border-[#27272a] rounded-xl overflow-hidden">
      {/* MCDU Header */}
      <div className="bg-[#141414] px-4 py-2 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#00ffff]" />
          <span className="text-sm font-mono text-[#00ffff] uppercase tracking-wider">
            Flight Log
          </span>
        </div>
      </div>

      {/* MCDU Form */}
      <Form {...form}>
        <form className="p-4 space-y-4 font-mono">
          {/* Row 1: Date, Tail, Type */}
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00ffff] text-xs">DATE</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-[#0a0a0a] border-[#27272a] text-[#00ff41] text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00ffff] text-xs">TAIL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="XA-ABC"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="bg-[#0a0a0a] border-[#27272a] text-[#00ff41] uppercase text-sm"
                      maxLength={10}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aircraftType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00ffff] text-xs">TYPE</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#27272a] text-[#00ff41] text-sm">
                        <SelectValue placeholder="A/C" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AIRCRAFT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: DEP / DEST */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="dep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00ffff] text-xs">DEP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MEX"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="bg-[#0a0a0a] border-[#27272a] text-[#00ff41] uppercase text-center text-lg"
                      maxLength={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#00ffff] text-xs">DEST</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CUN"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="bg-[#0a0a0a] border-[#27272a] text-[#00ff41] uppercase text-center text-lg"
                      maxLength={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Times (ZULU) */}
          <div className="border-t border-[#27272a] pt-4">
            <p className="text-[#ffbf00] text-xs mb-3 text-center">TIMES (ZULU)</p>
            <div className="grid grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="outTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ffbf00] text-xs w-8 block text-center">OUT</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="--:--"
                        value={field.value}
                        onChange={(e) => handleTimeInput(e, field.onChange)}
                        className="bg-[#0a0a0a] border-[#27272a] text-[#fafafa] text-center text-lg"
                        maxLength={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ffbf00] text-xs w-8 block text-center">OFF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="--:--"
                        value={field.value}
                        onChange={(e) => handleTimeInput(e, field.onChange)}
                        className="bg-[#0a0a0a] border-[#27272a] text-[#fafafa] text-center text-lg"
                        maxLength={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ffbf00] text-xs w-8 block text-center">ON</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="--:--"
                        value={field.value}
                        onChange={(e) => handleTimeInput(e, field.onChange)}
                        className="bg-[#0a0a0a] border-[#27272a] text-[#fafafa] text-center text-lg"
                        maxLength={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#ffbf00] text-xs w-8 block text-center">IN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="--:--"
                        value={field.value}
                        onChange={(e) => handleTimeInput(e, field.onChange)}
                        className="bg-[#0a0a0a] border-[#27272a] text-[#fafafa] text-center text-lg"
                        maxLength={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Row 4: Calculated Times */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-[#141414] rounded-lg">
              <p className="text-xs text-[#71717a] mb-1">FLT (ON-OFF)</p>
              <p className="text-2xl font-bold text-[#00ff41]">
                {flightTime || '--:--'}
              </p>
            </div>
            <div className="text-center p-3 bg-[#141414] rounded-lg">
              <p className="text-xs text-[#71717a] mb-1">BLK (IN-OUT)</p>
              <p className="text-2xl font-bold text-[#00ff41]">
                {blockTime || '--:--'}
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
