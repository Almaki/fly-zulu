'use client'

import { useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Progress } from '@/shared/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

const INITIAL_CHECKLIST: ChecklistSection[] = [
  {
    id: 'emergency',
    title: 'Equipos de Emergencia',
    items: [
      { id: 'fire-extinguisher', label: 'Extintores (cantidad y presión)', checked: false },
      { id: 'pbe', label: 'PBE (Protective Breathing Equipment)', checked: false },
      { id: 'first-aid', label: 'Botiquín de primeros auxilios', checked: false },
      { id: 'oxygen', label: 'Oxígeno portátil', checked: false },
      { id: 'aed', label: 'Desfibrilador (AED)', checked: false },
      { id: 'megaphone', label: 'Megáfono', checked: false },
      { id: 'flashlights', label: 'Linternas', checked: false },
    ],
  },
  {
    id: 'evacuation',
    title: 'Evacuación',
    items: [
      { id: 'slides', label: 'Toboganes armados', checked: false },
      { id: 'life-vests', label: 'Chalecos salvavidas', checked: false },
      { id: 'rafts', label: 'Balsas (si aplica)', checked: false },
      { id: 'exit-lights', label: 'Luces de salida', checked: false },
      { id: 'floor-lights', label: 'Luces de piso', checked: false },
      { id: 'exits-clear', label: 'Salidas despejadas', checked: false },
    ],
  },
  {
    id: 'cabin',
    title: 'Verificación de Cabina',
    items: [
      { id: 'overhead-bins', label: 'Compartimentos superiores cerrados', checked: false },
      { id: 'seatbelts', label: 'Cinturones de seguridad', checked: false },
      { id: 'tray-tables', label: 'Mesas plegadas', checked: false },
      { id: 'seats-upright', label: 'Asientos en posición vertical', checked: false },
      { id: 'window-shades', label: 'Persianas arriba (despegue/aterrizaje)', checked: false },
      { id: 'lavatory', label: 'Lavatorios verificados', checked: false },
      { id: 'galley', label: 'Galley asegurado', checked: false },
    ],
  },
  {
    id: 'documents',
    title: 'Documentación',
    items: [
      { id: 'safety-cards', label: 'Tarjetas de seguridad', checked: false },
      { id: 'briefing-done', label: 'Briefing realizado', checked: false },
      { id: 'pax-count', label: 'Conteo de pasajeros correcto', checked: false },
    ],
  },
]

export function SecurityChecklist() {
  const [checklist, setChecklist] = useState<ChecklistSection[]>(INITIAL_CHECKLIST)

  const toggleItem = (sectionId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : section
      )
    )
  }

  const totalItems = checklist.reduce((acc, s) => acc + s.items.length, 0)
  const checkedItems = checklist.reduce(
    (acc, s) => acc + s.items.filter((i) => i.checked).length,
    0
  )
  const progress = (checkedItems / totalItems) * 100
  const isComplete = checkedItems === totalItems

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Checklist de Seguridad</span>
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
        </CardTitle>
        <Progress
          value={progress}
          className={`h-2 mt-2 ${isComplete ? '[&>div]:bg-[#00ff88]' : ''}`}
        />
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" defaultValue={['emergency']} className="space-y-2">
          {checklist.map((section) => {
            const sectionChecked = section.items.filter((i) => i.checked).length
            const sectionComplete = sectionChecked === section.items.length

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-zinc-800 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span>{section.title}</span>
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
                    {section.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(section.id, item.id)}
                        />
                        <span
                          className={
                            item.checked ? 'text-zinc-500 line-through' : ''
                          }
                        >
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {!isComplete && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Completa todos los items antes del vuelo</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
