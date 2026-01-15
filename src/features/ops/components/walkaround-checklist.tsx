'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Progress } from '@/shared/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import { WALKAROUND_ZONES } from '../types'

interface CheckState {
  [zoneId: string]: {
    [itemIndex: number]: boolean
  }
}

export function WalkAroundChecklist() {
  const [checks, setChecks] = useState<CheckState>({})

  const toggleItem = (zoneId: string, itemIndex: number) => {
    setChecks((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [itemIndex]: !prev[zoneId]?.[itemIndex],
      },
    }))
  }

  const totalItems = WALKAROUND_ZONES.reduce((acc, z) => acc + z.items.length, 0)
  const checkedItems = Object.values(checks).reduce(
    (acc, zone) => acc + Object.values(zone).filter(Boolean).length,
    0
  )
  const progress = (checkedItems / totalItems) * 100
  const isComplete = checkedItems === totalItems

  const getZoneProgress = (zoneId: string, itemCount: number) => {
    const zoneChecks = checks[zoneId] || {}
    return Object.values(zoneChecks).filter(Boolean).length
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Walk Around Check</span>
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
        <Accordion type="multiple" defaultValue={['nose']} className="space-y-2">
          {WALKAROUND_ZONES.map((zone) => {
            const zoneChecked = getZoneProgress(zone.id, zone.items.length)
            const zoneComplete = zoneChecked === zone.items.length

            return (
              <AccordionItem
                key={zone.id}
                value={zone.id}
                className="border border-zinc-800 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span>{zone.name}</span>
                    {zoneComplete ? (
                      <Check className="h-4 w-4 text-[#00ff88]" />
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {zoneChecked}/{zone.items.length}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 py-2">
                    {zone.items.map((item, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={checks[zone.id]?.[index] || false}
                          onCheckedChange={() => toggleItem(zone.id, index)}
                        />
                        <span
                          className={
                            checks[zone.id]?.[index]
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
  )
}
