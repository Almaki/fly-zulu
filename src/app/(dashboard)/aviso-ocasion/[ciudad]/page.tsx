'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Megaphone, Users, Search, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { AvisoCard, AvisoForm } from '@/features/avisos-ocasion/components'
import { getAvisosByCiudad } from '@/features/avisos-ocasion/services'
import { cn } from '@/shared/lib/utils'
import type { Aviso, CiudadCode, AvisoCategoria } from '@/features/avisos-ocasion/types'
import { AVISO_CATEGORIAS, CIUDADES_INFO } from '@/features/avisos-ocasion/types'

const VALID_CIUDADES = ['tij', 'bjx', 'gdl', 'mty', 'mex', 'cun']

export default function CiudadAvisosPage() {
  const params = useParams()
  const router = useRouter()
  const ciudadParam = params.ciudad as string

  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<AvisoCategoria | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Validate ciudad
  const isValidCiudad = VALID_CIUDADES.includes(ciudadParam?.toLowerCase())
  const ciudadCode = ciudadParam?.toUpperCase() as CiudadCode
  const ciudadInfo = isValidCiudad ? CIUDADES_INFO[ciudadCode] : null

  const fetchAvisos = useCallback(async () => {
    if (!isValidCiudad) return

    setIsLoading(true)
    const { data } = await getAvisosByCiudad(ciudadCode)
    setAvisos(data || [])
    setIsLoading(false)
  }, [ciudadCode, isValidCiudad])

  useEffect(() => {
    fetchAvisos()
  }, [fetchAvisos])

  // Filter avisos by category and search query
  const filteredAvisos = useMemo(() => {
    let result = avisos

    // Filter by category
    if (selectedCategoria !== 'all') {
      result = result.filter(a => a.categoria === selectedCategoria)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(a =>
        a.titulo.toLowerCase().includes(query) ||
        a.descripcion.toLowerCase().includes(query) ||
        (a.nombre_conductor && a.nombre_conductor.toLowerCase().includes(query))
      )
    }

    return result
  }, [avisos, selectedCategoria, searchQuery])

  if (!isValidCiudad) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#ef4444] mb-4">Ciudad no válida</p>
          <Button onClick={() => router.push('/aviso-ocasion')} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/aviso-ocasion')}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#a1a1aa]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E91E8C] text-xl">{ciudadCode}</span>
              <span className="text-[#fafafa] font-medium">{ciudadInfo?.city}</span>
            </div>
            <p className="text-xs text-[#71717a]">{ciudadInfo?.state}</p>
          </div>
          <Button
            size="sm"
            className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Publicar
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar avisos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-[#0a0a0a] border-[#27272a] focus:border-[#E91E8C] h-10 text-sm rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-800 active:scale-95"
            >
              <X className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          )}
        </div>

        {/* Category Chips - Horizontal Scroll */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategoria('all')}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all text-xs",
              selectedCategoria === 'all'
                ? "bg-[#E91E8C] border-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/20"
                : "bg-[#0a0a0a] border-[#27272a] text-zinc-400 active:scale-95"
            )}
          >
            <span className="text-sm">🔍</span>
            <span className="font-medium">Todos</span>
          </button>
          {AVISO_CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all text-xs",
                selectedCategoria === cat.id
                  ? "bg-[#E91E8C] border-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/20"
                  : "bg-[#0a0a0a] border-[#27272a] text-zinc-400 active:scale-95"
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="font-medium">{cat.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Avisos List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full bg-zinc-800" />
            ))
          ) : filteredAvisos.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl border border-[#E91E8C]/30 bg-gradient-to-br from-[#141414] to-[#1a0a12] p-6">
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#E91E8C]/20 border border-[#E91E8C]/30">
                <Users className="w-3 h-3 text-[#E91E8C]" />
                <span className="text-[10px] font-medium text-[#E91E8C]">Crew Only</span>
              </div>

              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-[#E91E8C]/10 mb-4">
                  {searchQuery ? (
                    <Search className="h-10 w-10 text-[#E91E8C]" />
                  ) : (
                    <Megaphone className="h-10 w-10 text-[#E91E8C]" />
                  )}
                </div>

                <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
                  {searchQuery
                    ? `No encontramos "${searchQuery}"`
                    : selectedCategoria === 'all'
                      ? `¡Sé el primero en publicar en ${ciudadCode}!`
                      : 'No hay avisos en esta categoría'
                  }
                </h3>
                <p className="text-sm text-[#a1a1aa] mb-6 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Intenta con otros términos o busca en otra categoría'
                    : 'Publica lo que quieras vender, rentar o buscar. Solo tripulaciones verificadas lo verán.'
                  }
                </p>

                {searchQuery ? (
                  <Button
                    variant="outline"
                    className="border-[#E91E8C] text-[#E91E8C] hover:bg-[#E91E8C]/10"
                    onClick={() => { setSearchQuery(''); setSelectedCategoria('all'); }}
                  >
                    Limpiar búsqueda
                  </Button>
                ) : (
                  <Button
                    className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-semibold px-6"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar primer aviso
                  </Button>
                )}
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#E91E8C]/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          ) : (
            filteredAvisos.map((aviso) => (
              <AvisoCard
                key={aviso.id}
                aviso={aviso}
                onDeleted={fetchAvisos}
              />
            ))
          )}
        </div>

        {filteredAvisos.length > 0 && (
          <p className="text-center text-xs text-zinc-600 mt-4">
            {filteredAvisos.length} {filteredAvisos.length === 1 ? 'aviso' : 'avisos'}
          </p>
        )}

        {/* Footer */}
        <div className="text-center py-4 border-t border-[#1f1f1f] mt-6">
          <div className="flex items-center justify-center gap-2 text-[#71717a] text-xs">
            <Users className="w-3 h-3" />
            <span>Avisos visibles por 30 días</span>
          </div>
        </div>

        {/* Form Modal */}
        <AvisoForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          ciudadCode={ciudadCode}
          onSuccess={fetchAvisos}
        />
      </div>
    </div>
  )
}
