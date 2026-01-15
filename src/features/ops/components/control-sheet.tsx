'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2, Calculator } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form'
import { Separator } from '@/shared/components/ui/separator'
import { controlSheetSchema, calculatePaxWeight, type ControlSheetFormData } from '../types'
import { PAX_WEIGHTS } from '@/shared/constants'

export function ControlSheet() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ControlSheetFormData>({
    resolver: zodResolver(controlSheetSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      flight_number: '',
      aircraft_registration: '',
      origin: '',
      destination: '',
      fuel_initial: 0,
      fuel_final: 0,
      fuel_distribution: {
        wing_left: 0,
        wing_right: 0,
        center: 0,
        trim: 0,
      },
      pax_male: 0,
      pax_female: 0,
      pax_child: 0,
      pax_infant: 0,
      cargo_fwd: 0,
      cargo_aft: 0,
      cargo_bulk: 0,
    },
  })

  const watchPax = form.watch(['pax_male', 'pax_female', 'pax_child'])
  const watchCargo = form.watch(['cargo_fwd', 'cargo_aft', 'cargo_bulk'])

  const paxWeight = calculatePaxWeight(watchPax[0] || 0, watchPax[1] || 0, watchPax[2] || 0)
  const totalCargo = (watchCargo[0] || 0) + (watchCargo[1] || 0) + (watchCargo[2] || 0)
  const totalPax = (watchPax[0] || 0) + (watchPax[1] || 0) + (watchPax[2] || 0)

  async function onSubmit(data: ControlSheetFormData) {
    setIsLoading(true)
    try {
      // TODO: Save to Supabase
      toast.success('Hoja de control guardada')
      console.log(data)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle>Hoja de Control</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Flight Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Datos del Vuelo</h3>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="flight_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vuelo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Y4123"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
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
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Fuel */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Combustible (lbs)</h3>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fuel_initial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuel_final"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* PAX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">Cierre de Clientes</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>H={PAX_WEIGHTS.H}kg</span>
                  <span>M={PAX_WEIGHTS.M}kg</span>
                  <span>Med={PAX_WEIGHTS.Med}kg</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <FormField
                  control={form.control}
                  name="pax_male"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>H</FormLabel>
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
                  name="pax_female"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M</FormLabel>
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
                  name="pax_child"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Med</FormLabel>
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
                  name="pax_infant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>INF</FormLabel>
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

              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">Total PAX: {totalPax}</span>
                </div>
                <span className="text-sm font-medium text-[#00ff88]">
                  {paxWeight.toLocaleString()} kg
                </span>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Cargo */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Distribución Carga (kg)</h3>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="cargo_fwd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FWD</FormLabel>
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
                  name="cargo_aft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AFT</FormLabel>
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
                  name="cargo_bulk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BULK</FormLabel>
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

              <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <span className="text-sm text-zinc-400">Total Carga</span>
                <span className="text-sm font-medium text-[#00ff88]">
                  {totalCargo.toLocaleString()} kg
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Hoja de Control'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
