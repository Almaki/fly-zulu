'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
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
import { incidentSchema, INCIDENT_TYPES, type IncidentFormData } from '../types'
import { createIncident } from '../services'
import { useFAStore } from '../store'
import type { Incident } from '../types'

export function IncidentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const addIncident = useFAStore((state) => state.addIncident)

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      type: 'OTHER',
      description: '',
      actions_taken: '',
      witnesses: '',
    },
  })

  async function onSubmit(data: IncidentFormData) {
    setIsLoading(true)

    try {
      const result = await createIncident(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        addIncident(result.data as Incident)
        toast.success('Incidente reportado')
        form.reset({
          type: 'OTHER',
          description: '',
          actions_taken: '',
          witnesses: '',
        })
      }
    } catch {
      toast.error('Error al reportar incidente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#FF9500]" />
          Reportar Incidente
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Incidente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INCIDENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el incidente en detalle..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actions_taken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acciones Tomadas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe las acciones que se tomaron..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="witnesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testigos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nombres de testigos..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-black font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reportando...
                </>
              ) : (
                'Reportar Incidente'
              )}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-zinc-600 mt-4 text-center">
          Este reporte será enviado a la gerencia de operaciones
        </p>
      </CardContent>
    </Card>
  )
}
