'use client'

import { useState } from 'react'
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'

import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'

const RULES = [
  'Respeta a todos los miembros de la tripulación',
  'No compartas información confidencial de la empresa',
  'Evita lenguaje ofensivo o discriminatorio',
  'No publiques datos personales de otros',
  'Las publicaciones anónimas deben seguir las mismas reglas',
  'Los administradores pueden ver el autor de posts anónimos',
  'Reporta contenido inapropiado a los administradores',
]

export function ForumRules() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>Reglas de convivencia</span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              )}
            </CardContent>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <ul className="space-y-2">
              {RULES.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="text-[#22c55e] mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
