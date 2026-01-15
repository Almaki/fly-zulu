'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import type { FIDSFilters } from '../types'

interface FIDSFiltersProps {
  filters: FIDSFilters
  onChange: (filters: Partial<FIDSFilters>) => void
}

export function FIDSFiltersComponent({ filters, onChange }: FIDSFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Direction tabs */}
      <Tabs
        value={filters.direction || 'all'}
        onValueChange={(value) =>
          onChange({ direction: value as FIDSFilters['direction'] })
        }
      >
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="departures">Salidas</TabsTrigger>
          <TabsTrigger value="arrivals">Llegadas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        {/* Airport filter */}
        <Input
          placeholder="Aeropuerto (MEX)"
          value={filters.airport || ''}
          onChange={(e) =>
            onChange({ airport: e.target.value.toUpperCase() || undefined })
          }
          maxLength={3}
          className="flex-1 uppercase"
        />

        {/* Status filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onChange({ status: value as FIDSFilters['status'] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ON_TIME">On Time</SelectItem>
            <SelectItem value="DELAY">Delay</SelectItem>
            <SelectItem value="GATE_CHANGE">Gate Change</SelectItem>
            <SelectItem value="CANCELED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
