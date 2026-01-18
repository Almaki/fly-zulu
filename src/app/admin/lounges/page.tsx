'use client'

import { useState } from 'react'
import { MessageSquare, Users } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { LoungePage } from '@/features/forum/components'
import type { LoungeType } from '@/features/forum/types'
import { LOUNGE_INFO } from '@/features/forum/types'

const LOUNGE_COLORS: Record<LoungeType, string> = {
  CREW: 'bg-[#E91E8C]/20 text-[#E91E8C] border-[#E91E8C]/30',
  OPS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  TRAFICO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  MANTTO: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminLoungesPage() {
  const [selectedLounge, setSelectedLounge] = useState<LoungeType | null>(null)

  if (selectedLounge) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedLounge(null)}
          className="mb-2"
        >
          Volver a seleccionar lounge
        </Button>
        <LoungePage loungeType={selectedLounge} backUrl="/admin/lounges" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Panel de Lounges</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Selecciona un lounge para ver y moderar su contenido
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(LOUNGE_INFO) as [LoungeType, { name: string; allowedPositions: string[] }][]).map(
          ([type, info]) => (
            <Card
              key={type}
              className={`border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 cursor-pointer transition-all ${LOUNGE_COLORS[type].split(' ').slice(2).join(' ')}`}
              onClick={() => setSelectedLounge(type)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${LOUNGE_COLORS[type].split(' ').slice(0, 2).join(' ')}`}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-lg text-[#fafafa]">{info.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="h-4 w-4" />
                  <span>
                    Acceso: {info.allowedPositions.join(', ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
