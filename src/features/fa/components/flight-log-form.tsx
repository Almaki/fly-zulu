'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
import { faLogSchema, FLEJE_COLORS, type FALogFormData } from '../types'
import { createFALog } from '../services'
import { useFAStore } from '../store'
import { AIRCRAFT_TYPES } from '@/features/pilot/types'
import type { FALog } from '../types'

const STEPS = [
  { id: 'flight', title: 'Datos de Vuelo' },
  { id: 'times', title: 'Tiempos' },
  { id: 'service', title: 'Servicio a Bordo' },
]

export function FlightLogForm() {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const addLog = useFAStore((state) => state.addLog)

  const form = useForm<FALogFormData>({
    resolver: zodResolver(faLogSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      flight_number: '',
      aircraft_type: '',
      aircraft_registration: '',
      origin: '',
      destination: '',
      captain: '',
      copilot: '',
      entry_time: '',
      release_time: '',
      boarding_time: '',
      first_pax_time: '',
      last_pax_time: '',
      door_close_time: '',
      bar_set_number: '',
      fleje_color: '',
      cash_folio: '',
      sales_mxn: 0,
      sales_usd: 0,
      sales_card: 0,
    },
  })

  async function onSubmit(data: FALogFormData) {
    setIsLoading(true)

    try {
      const result = await createFALog(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        addLog(result.data as FALog)
        toast.success('Vuelo registrado')
        form.reset({
          date: format(new Date(), 'yyyy-MM-dd'),
          flight_number: '',
          aircraft_type: data.aircraft_type,
          aircraft_registration: data.aircraft_registration,
          origin: data.destination,
          destination: '',
          captain: data.captain,
          copilot: data.copilot,
          entry_time: '',
          release_time: '',
          boarding_time: '',
          first_pax_time: '',
          last_pax_time: '',
          door_close_time: '',
          bar_set_number: '',
          fleje_color: '',
          cash_folio: '',
          sales_mxn: 0,
          sales_usd: 0,
          sales_card: 0,
        })
        setStep(0)
      }
    } catch {
      toast.error('Error al registrar vuelo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-center">{STEPS[step].title}</CardTitle>
        {/* Progress indicator */}
        <div className="flex justify-between mt-4">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= step
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    i < step ? 'bg-[#00ff88]' : 'bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 0: Flight Data */}
            {step === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flight_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Vuelo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Y4123"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="aircraft_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo A/C</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aircraft_registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="XA-ABC"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origen</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MEX"
                            maxLength={3}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CUN"
                            maxLength={3}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="captain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capitán</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="copilot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copiloto</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Step 1: Times */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="entry_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="release_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dar Libre</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="boarding_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abordaje</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="first_pax_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer PAX</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="last_pax_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último PAX</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="door_close_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cierre</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Step 2: Service */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="bar_set_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bar Set #</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fleje_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Fleje</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FLEJE_COLORS.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border border-zinc-600"
                                    style={{ backgroundColor: color.color }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cash_folio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Folio Cash</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="border-t border-zinc-800 pt-4 mt-4">
                  <p className="text-sm font-medium mb-3">Ventas</p>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="sales_mxn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MXN</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sales_usd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>USD</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sales_card"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarjeta</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex-1"
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Vuelo'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
