'use client'

import { Plane, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface EndFlightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flightSummary: {
    dep: string
    dest: string
    flightTime: string
    blockTime: string
  }
  onAddAnother: () => void
  onEndDay: () => void
}

export function EndFlightDialog({
  open,
  onOpenChange,
  flightSummary,
  onAddAnother,
  onEndDay,
}: EndFlightDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-zinc-800 max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full bg-[#22c55e]/20">
              <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
            </div>
          </div>
          <DialogTitle className="text-center text-[#fafafa]">
            Vuelo Completado
          </DialogTitle>
          <DialogDescription className="text-center text-[#a1a1aa]">
            {flightSummary.dep} → {flightSummary.dest}
          </DialogDescription>
        </DialogHeader>

        {/* Flight Summary */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="text-center p-3 bg-background rounded-lg border border-[#27272a]">
            <p className="text-xs text-[#71717a] mb-1">Tiempo de Vuelo</p>
            <p className="text-xl font-mono font-bold text-[#00ff41]">
              {flightSummary.flightTime}
            </p>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border border-[#27272a]">
            <p className="text-xs text-[#71717a] mb-1">Tiempo Block</p>
            <p className="text-xl font-mono font-bold text-[#00ff41]">
              {flightSummary.blockTime}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onAddAnother}
            className="w-full bg-[#0066CC] hover:bg-[#0066CC]/90"
          >
            <Plane className="w-4 h-4 mr-2" />
            Agregar otro vuelo
          </Button>

          <Button
            onClick={onEndDay}
            variant="outline"
            className="w-full border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Fin de Día
          </Button>
        </div>

        <p className="text-xs text-center text-[#52525b] mt-2">
          Los datos se guardarán en tu historial
        </p>
      </DialogContent>
    </Dialog>
  )
}
