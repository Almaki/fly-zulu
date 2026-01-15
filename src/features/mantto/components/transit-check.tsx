'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Check, AlertTriangle, Wrench } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Progress } from '@/shared/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form'

const TRANSIT_SECTIONS = [
  {
    id: 'documents',
    name: 'Documentación',
    items: [
      'Technical Log Review',
      'MEL/CDL Items',
      'Deferred Items Check',
      'Certificate Validity',
    ],
  },
  {
    id: 'exterior',
    name: 'Inspección Exterior',
    items: [
      'Fuselaje - Daños visibles',
      'Alas - Condición general',
      'Tren de aterrizaje',
      'Motores - Inspección visual',
      'Antenas - Condición',
      'Pitot/Static - Limpieza',
    ],
  },
  {
    id: 'cockpit',
    name: 'Cockpit',
    items: [
      'Instrumentos - Check funcional',
      'Controles de vuelo',
      'Sistemas hidráulicos',
      'Avionics check',
    ],
  },
  {
    id: 'cabin',
    name: 'Cabina',
    items: [
      'Asientos - Condición',
      'Equipos de emergencia',
      'Iluminación',
      'Aire acondicionado',
      'Lavatorios',
    ],
  },
  {
    id: 'systems',
    name: 'Sistemas',
    items: [
      'Eléctrico - Check',
      'Hidráulico - Niveles',
      'Neumático',
      'Fuel system',
      'APU - Funcional',
    ],
  },
]

interface OilLevel {
  engine: number
  level: string
}

interface TransitFormData {
  aircraft_registration: string
  flight_number: string
  date: string
  oil_levels: OilLevel[]
  discrepancies: string
  dgac_license: string
}

export function TransitCheck() {
  const [checks, setChecks] = useState<Record<string, Record<number, boolean>>>({})

  const form = useForm<TransitFormData>({
    defaultValues: {
      aircraft_registration: '',
      flight_number: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      oil_levels: [
        { engine: 1, level: '' },
        { engine: 2, level: '' },
      ],
      discrepancies: '',
      dgac_license: '',
    },
  })

  const toggleItem = (sectionId: string, itemIndex: number) => {
    setChecks((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [itemIndex]: !prev[sectionId]?.[itemIndex],
      },
    }))
  }

  const totalItems = TRANSIT_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)
  const checkedItems = Object.values(checks).reduce(
    (acc, section) => acc + Object.values(section).filter(Boolean).length,
    0
  )
  const progress = (checkedItems / totalItems) * 100
  const isComplete = checkedItems === totalItems

  const getSectionProgress = (sectionId: string, itemCount: number) => {
    const sectionChecks = checks[sectionId] || {}
    return Object.values(sectionChecks).filter(Boolean).length
  }

  return (
    <div className="space-y-4">
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Transit Check R24
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Oil levels */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Niveles de Aceite (Qts)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500">Motor 1</label>
                    <Input placeholder="12.5" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Motor 2</label>
                    <Input placeholder="12.5" />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Checklist</CardTitle>
            {isComplete ? (
              <span className="flex items-center gap-1 text-sm text-[#00ff88]">
                <Check className="h-4 w-4" />
                Completo
              </span>
            ) : (
              <span className="text-sm text-zinc-400">
                {checkedItems}/{totalItems}
              </span>
            )}
          </div>
          <Progress
            value={progress}
            className={`h-2 mt-2 ${isComplete ? '[&>div]:bg-[#00ff88]' : ''}`}
          />
        </CardHeader>

        <CardContent>
          <Accordion
            type="multiple"
            defaultValue={['documents']}
            className="space-y-2"
          >
            {TRANSIT_SECTIONS.map((section) => {
              const sectionChecked = getSectionProgress(
                section.id,
                section.items.length
              )
              const sectionComplete = sectionChecked === section.items.length

              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border border-zinc-800 rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span>{section.name}</span>
                      {sectionComplete ? (
                        <Check className="h-4 w-4 text-[#00ff88]" />
                      ) : (
                        <span className="text-xs text-zinc-500">
                          {sectionChecked}/{section.items.length}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 py-2">
                      {section.items.map((item, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Checkbox
                            checked={checks[section.id]?.[index] || false}
                            onCheckedChange={() =>
                              toggleItem(section.id, index)
                            }
                          />
                          <span
                            className={
                              checks[section.id]?.[index]
                                ? 'text-zinc-500 line-through'
                                : ''
                            }
                          >
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Discrepancies */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-[#FF9500]" />
            Discrepancias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Registrar cualquier discrepancia encontrada..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Certification */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Licencia DGAC</label>
              <Input placeholder="Número de licencia" className="mt-1" />
            </div>
            <Button className="w-full" disabled={!isComplete}>
              Firmar y Certificar
            </Button>
            <p className="text-xs text-zinc-500 text-center">
              Al firmar certifico que la inspección fue completada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
