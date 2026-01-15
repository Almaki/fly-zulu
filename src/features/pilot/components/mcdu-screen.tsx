'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
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
  FormMessage,
} from '@/shared/components/ui/form'
import { mcduEntrySchema, AIRCRAFT_TYPES, type MCDUEntryFormData } from '../types'
import { createPilotLog } from '../services'
import { usePilotStore } from '../store'
import type { PilotLog } from '../types'

export function MCDUScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const addLog = usePilotStore((state) => state.addLog)

  const form = useForm<MCDUEntryFormData>({
    resolver: zodResolver(mcduEntrySchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      tail: '',
      aircraft_type: '',
      dep: '',
      dest: '',
      out_time: '',
      off_time: '',
      on_time: '',
      in_time: '',
      notes: '',
    },
  })

  // Calculate flight and block time
  const watchAll = form.watch()
  const { out_time, off_time, on_time, in_time } = watchAll

  const calculateTimes = () => {
    if (!out_time || !off_time || !on_time || !in_time) {
      return { flightTime: '--:--', blockTime: '--:--' }
    }

    try {
      const [outH, outM] = out_time.split(':').map(Number)
      const [offH, offM] = off_time.split(':').map(Number)
      const [onH, onM] = on_time.split(':').map(Number)
      const [inH, inM] = in_time.split(':').map(Number)

      let flightMinutes = (onH * 60 + onM) - (offH * 60 + offM)
      if (flightMinutes < 0) flightMinutes += 24 * 60

      let blockMinutes = (inH * 60 + inM) - (outH * 60 + outM)
      if (blockMinutes < 0) blockMinutes += 24 * 60

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }

      return {
        flightTime: formatTime(flightMinutes),
        blockTime: formatTime(blockMinutes),
      }
    } catch {
      return { flightTime: '--:--', blockTime: '--:--' }
    }
  }

  const { flightTime, blockTime } = calculateTimes()

  async function onSubmit(data: MCDUEntryFormData) {
    setIsLoading(true)

    try {
      const result = await createPilotLog(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        addLog(result.data as PilotLog)
        toast.success('Vuelo registrado')
        form.reset({
          date: format(new Date(), 'yyyy-MM-dd'),
          tail: data.tail, // Keep tail for multi-leg
          aircraft_type: data.aircraft_type,
          dep: data.dest, // Next leg starts where this one ended
          dest: '',
          out_time: '',
          off_time: '',
          on_time: '',
          in_time: '',
          notes: '',
        })
      }
    } catch {
      toast.error('Error al registrar vuelo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mcdu-screen rounded-lg border border-zinc-800 p-4">
      {/* MCDU Header */}
      <div className="text-center mb-4 border-b border-zinc-800 pb-3">
        <p className="mcdu-cyan text-xs">FLY-ZULU MCDU</p>
        <p className="mcdu-text text-lg font-bold tracking-widest">LOGBOOK</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: DATE */}
          <div className="flex items-center gap-4">
            <span className="mcdu-amber text-xs w-16">DATE</span>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="date"
                      className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF3B30]" />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: TAIL / TYPE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">TAIL</span>
              <FormField
                control={form.control}
                name="tail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="XA-ABC"
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono uppercase"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">TYPE</span>
              <FormField
                control={form.control}
                name="aircraft_type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mcdu-screen border-zinc-700 mcdu-text font-mono">
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
          </div>

          {/* Row 3: DEP / DEST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">DEP</span>
              <FormField
                control={form.control}
                name="dep"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="MEX"
                        maxLength={3}
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono uppercase text-center"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">DEST</span>
              <FormField
                control={form.control}
                name="dest"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="CUN"
                        maxLength={3}
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono uppercase text-center"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Times Section Header */}
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <p className="mcdu-cyan text-xs text-center mb-2">TIMES (ZULU)</p>
          </div>

          {/* Row 4: OUT / OFF */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">OUT</span>
              <FormField
                control={form.control}
                name="out_time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="time"
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">OFF</span>
              <FormField
                control={form.control}
                name="off_time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="time"
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Row 5: ON / IN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">ON</span>
              <FormField
                control={form.control}
                name="on_time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="time"
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="mcdu-amber text-xs">IN</span>
              <FormField
                control={form.control}
                name="in_time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="time"
                        className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Calculated times */}
          <div className="border-t border-zinc-800 pt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="mcdu-cyan text-xs">FLT TIME</p>
              <p className="mcdu-text text-xl font-mono">{flightTime}</p>
            </div>
            <div className="text-center">
              <p className="mcdu-cyan text-xs">BLK TIME</p>
              <p className="mcdu-text text-xl font-mono">{blockTime}</p>
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mcdu-amber text-xs">REMARKS</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Opcional"
                    className="mcdu-screen border-zinc-700 mcdu-text font-mono"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#00ff41] hover:bg-[#00ff41]/90 text-black font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                SAVING...
              </>
            ) : (
              'SAVE ENTRY'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
