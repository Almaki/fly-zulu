'use client'

import { useState, useEffect } from 'react'
import { Calendar, Truck, Dog, PawPrint, Ban, Check, Car, Home, Building2, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { createAviso } from '../services'
import { AddressAutocomplete, type AddressResult } from './address-autocomplete'
import type { CiudadCode, AvisoFormData, AvisoCategoria, ServicioIncluido, TipoInmueble, TipoAutoTaxi } from '../types'
import {
  AVISO_CATEGORIAS,
  CIUDADES_INFO,
  SERVICIOS_INCLUIDOS_OPTIONS,
  TIPO_INMUEBLE_OPTIONS,
  TIPO_AUTO_TAXI_OPTIONS,
  categoriaNecesitaDireccion,
  categoriaEsRoomie,
  categoriaEsInmueble,
  categoriaEsTaxi,
  categoriaPermiteDomicilio,
  categoriaPermiteMascotas
} from '../types'

interface AvisoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ciudadCode: CiudadCode
  onSuccess?: () => void
}

const ALL_SERVICES: ServicioIncluido[] = ['internet', 'agua', 'luz', 'gas', 'mantenimiento']

export function AvisoForm({ open, onOpenChange, ciudadCode, onSuccess }: AvisoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AvisoFormData>({
    ciudad_code: ciudadCode,
    categoria: 'venta',
    titulo: '',
    descripcion: '',
    precio: null,
    moneda: 'MXN',
    whatsapp: '',
    telefono: '',
    // Campos inmuebles/roomie
    direccion: '',
    direccion_lat: undefined,
    direccion_lng: undefined,
    fecha_disponibilidad: '',
    // Campos inmuebles
    tipo_inmueble: undefined,
    tiene_cochera: undefined,
    // Campos roomie/inmuebles
    acepta_mascotas: undefined,
    servicios_incluidos: [],
    precio_todo_incluido: false,
    // General
    servicio_domicilio: false,
    // Taxi seguro
    nombre_conductor: '',
    tipo_auto_taxi: undefined,
  })

  const needsDireccion = categoriaNecesitaDireccion(formData.categoria)
  const isRoomie = categoriaEsRoomie(formData.categoria)
  const isInmueble = categoriaEsInmueble(formData.categoria)
  const isTaxi = categoriaEsTaxi(formData.categoria)
  const permiteDomicilio = categoriaPermiteDomicilio(formData.categoria)
  const permiteMascotas = categoriaPermiteMascotas(formData.categoria)

  // Auto-llenar servicios cuando se marca "todo incluido"
  useEffect(() => {
    if (formData.precio_todo_incluido) {
      setFormData(prev => ({
        ...prev,
        servicios_incluidos: ALL_SERVICES
      }))
    }
  }, [formData.precio_todo_incluido])

  const handleAddressChange = (result: AddressResult | null) => {
    if (result) {
      setFormData({
        ...formData,
        direccion: result.address,
        direccion_lat: result.lat || undefined,
        direccion_lng: result.lng || undefined,
      })
    } else {
      setFormData({
        ...formData,
        direccion: '',
        direccion_lat: undefined,
        direccion_lng: undefined,
      })
    }
  }

  const toggleServicio = (servicio: ServicioIncluido) => {
    const current = formData.servicios_incluidos || []
    if (current.includes(servicio)) {
      setFormData({
        ...formData,
        servicios_incluidos: current.filter(s => s !== servicio),
        precio_todo_incluido: false // Desmarcar "todo incluido" si quitan un servicio
      })
    } else {
      setFormData({
        ...formData,
        servicios_incluidos: [...current, servicio]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es requerido')
      setIsLoading(false)
      return
    }

    if (!formData.descripcion.trim()) {
      setError('La descripción es requerida')
      setIsLoading(false)
      return
    }

    if (!formData.whatsapp && !formData.telefono) {
      setError('Debes proporcionar al menos un método de contacto')
      setIsLoading(false)
      return
    }

    // Validación específica para taxi
    if (isTaxi && !formData.nombre_conductor?.trim()) {
      setError('El nombre del conductor es requerido')
      setIsLoading(false)
      return
    }

    const { error: submitError } = await createAviso({
      ...formData,
      ciudad_code: ciudadCode,
    })

    setIsLoading(false)

    if (submitError) {
      setError(submitError)
      return
    }

    // Reset form
    setFormData({
      ciudad_code: ciudadCode,
      categoria: 'venta',
      titulo: '',
      descripcion: '',
      precio: null,
      moneda: 'MXN',
      whatsapp: '',
      telefono: '',
      direccion: '',
      direccion_lat: undefined,
      direccion_lng: undefined,
      fecha_disponibilidad: '',
      tipo_inmueble: undefined,
      tiene_cochera: undefined,
      acepta_mascotas: undefined,
      servicios_incluidos: [],
      precio_todo_incluido: false,
      servicio_domicilio: false,
      nombre_conductor: '',
      tipo_auto_taxi: undefined,
    })

    onOpenChange(false)
    onSuccess?.()
  }

  const ciudadInfo = CIUDADES_INFO[ciudadCode]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-[#27272a]">
        <DialogHeader>
          <DialogTitle className="text-[#fafafa]">
            Nuevo Aviso en {ciudadCode}
          </DialogTitle>
          <p className="text-xs text-[#71717a]">{ciudadInfo.city}, {ciudadInfo.state}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Categoría */}
          <div>
            <label className="text-sm text-[#a1a1aa] mb-1.5 block">Categoría</label>
            <Select
              value={formData.categoria}
              onValueChange={(val) => setFormData({ ...formData, categoria: val as AvisoCategoria })}
            >
              <SelectTrigger className="bg-[#141414] border-[#27272a]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#27272a]">
                {AVISO_CATEGORIAS.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ========== CAMPOS PARA TAXI SEGURO ========== */}
          {isTaxi && (
            <>
              {/* Nombre del conductor */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-1.5 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre del conductor
                </label>
                <Input
                  value={formData.nombre_conductor || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_conductor: e.target.value })}
                  placeholder="Nombre completo"
                  className="bg-[#141414] border-[#27272a]"
                />
              </div>

              {/* Tipo de auto */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-2 block">Tipo de auto</label>
                <div className="flex gap-2">
                  {TIPO_AUTO_TAXI_OPTIONS.map(tipo => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_auto_taxi: tipo.id })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        formData.tipo_auto_taxi === tipo.id
                          ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                          : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                      }`}
                    >
                      <span>{tipo.emoji}</span>
                      <span className="text-sm">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Título */}
          <div>
            <label className="text-sm text-[#a1a1aa] mb-1.5 block">
              {isTaxi ? 'Descripción del servicio' : 'Título'}
            </label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder={isTaxi ? "Ej: Taxi seguro aeropuerto-ciudad" : "Ej: Rento departamento cerca del aeropuerto"}
              maxLength={100}
              className="bg-[#141414] border-[#27272a]"
            />
            <p className="text-xs text-[#52525b] mt-1">{formData.titulo.length}/100</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-[#a1a1aa] mb-1.5 block">
              {isTaxi ? 'Detalles adicionales' : 'Descripción'}
            </label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder={isTaxi ? "Horarios disponibles, zonas de servicio, etc..." : "Describe tu aviso con detalles..."}
              maxLength={1000}
              rows={3}
              className="bg-[#141414] border-[#27272a] resize-none"
            />
            <p className="text-xs text-[#52525b] mt-1">{formData.descripcion.length}/1000</p>
          </div>

          {/* Precio (no para taxi) */}
          {!isTaxi && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-sm text-[#a1a1aa] mb-1.5 block">Precio (opcional)</label>
                <Input
                  type="number"
                  value={formData.precio || ''}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0"
                  min={0}
                  className="bg-[#141414] border-[#27272a]"
                />
              </div>
              <div>
                <label className="text-sm text-[#a1a1aa] mb-1.5 block">Moneda</label>
                <Select
                  value={formData.moneda}
                  onValueChange={(val) => setFormData({ ...formData, moneda: val as 'MXN' | 'USD' })}
                >
                  <SelectTrigger className="bg-[#141414] border-[#27272a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#27272a]">
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* ========== CAMPOS PARA INMUEBLES ========== */}
          {isInmueble && (
            <>
              {/* Tipo de inmueble */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-2 block">Tipo de inmueble</label>
                <div className="flex gap-2">
                  {TIPO_INMUEBLE_OPTIONS.map(tipo => (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_inmueble: tipo.id })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        formData.tipo_inmueble === tipo.id
                          ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                          : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                      }`}
                    >
                      {tipo.id === 'casa' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      <span className="text-sm">{tipo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cochera */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-2 block">¿Cuenta con cochera?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tiene_cochera: true })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                      formData.tiene_cochera === true
                        ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                        : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span className="text-sm">Sí</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tiene_cochera: false })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                      formData.tiene_cochera === false
                        ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]'
                        : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                    }`}
                  >
                    <span className="text-sm">No</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========== CAMPOS PARA INMUEBLES Y ROOMIE ========== */}
          {needsDireccion && (
            <>
              {/* Dirección con autocompletado */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-1.5 block">
                  Dirección del inmueble
                </label>
                <AddressAutocomplete
                  value={formData.direccion}
                  onChange={handleAddressChange}
                  ciudadCode={ciudadCode}
                  placeholder="Buscar dirección..."
                />
                <p className="text-xs text-[#52525b] mt-1">
                  Escribe para buscar o ingresa manualmente
                </p>
              </div>

              {/* Fecha de disponibilidad */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-1.5 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de disponibilidad
                </label>
                <Input
                  type="date"
                  value={formData.fecha_disponibilidad || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_disponibilidad: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-[#141414] border-[#27272a]"
                />
              </div>
            </>
          )}

          {/* ========== MASCOTAS (ROOMIE E INMUEBLES RENTA) ========== */}
          {permiteMascotas && (
            <div>
              <label className="text-sm text-[#a1a1aa] mb-2 block">¿Acepta mascotas?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, acepta_mascotas: true })}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    formData.acepta_mascotas === true
                      ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                      : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                  }`}
                >
                  <Dog className="w-4 h-4" />
                  <span className="text-sm">Sí</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, acepta_mascotas: false })}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    formData.acepta_mascotas === false
                      ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]'
                      : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="relative">
                    <PawPrint className="w-4 h-4" />
                    <Ban className="w-3 h-3 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-sm">No</span>
                </button>
              </div>
            </div>
          )}

          {/* ========== CAMPOS ESPECÍFICOS PARA ROOMIE ========== */}
          {isRoomie && (
            <>
              {/* Precio todo incluido - Checkbox primero */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a]">
                <Checkbox
                  id="precio_todo_incluido"
                  checked={formData.precio_todo_incluido}
                  onCheckedChange={(checked) => setFormData({ ...formData, precio_todo_incluido: !!checked })}
                />
                <label htmlFor="precio_todo_incluido" className="text-sm text-[#a1a1aa] cursor-pointer">
                  El precio incluye todos los servicios
                </label>
              </div>

              {/* Servicios incluidos */}
              <div>
                <label className="text-sm text-[#a1a1aa] mb-2 block">Servicios incluidos</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICIOS_INCLUIDOS_OPTIONS.map(servicio => {
                    const isSelected = formData.servicios_incluidos?.includes(servicio.id)
                    return (
                      <button
                        key={servicio.id}
                        type="button"
                        onClick={() => toggleServicio(servicio.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-[#22c55e] bg-[#22c55e]/10'
                            : 'border-[#27272a] hover:border-[#3f3f46]'
                        }`}
                      >
                        <span className="text-sm">{servicio.emoji}</span>
                        <span className={`text-xs flex-1 ${isSelected ? 'text-[#22c55e]' : 'text-[#a1a1aa]'}`}>
                          {servicio.label}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-[#22c55e]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ========== SERVICIO A DOMICILIO (EXCEPTO INMUEBLES Y TAXI) ========== */}
          {permiteDomicilio && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a]">
              <Checkbox
                id="servicio_domicilio"
                checked={formData.servicio_domicilio}
                onCheckedChange={(checked) => setFormData({ ...formData, servicio_domicilio: !!checked })}
              />
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#71717a]" />
                <label htmlFor="servicio_domicilio" className="text-sm text-[#a1a1aa] cursor-pointer">
                  Servicio/entrega a domicilio
                </label>
              </div>
            </div>
          )}

          {/* Contacto WhatsApp - Requerido para todos */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-[#a1a1aa] mb-1.5 block">WhatsApp *</label>
              <Input
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+52 1234567890"
                className="bg-[#141414] border-[#27272a]"
              />
            </div>
            <div>
              <label className="text-sm text-[#a1a1aa] mb-1.5 block">Teléfono</label>
              <Input
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="(opcional)"
                className="bg-[#141414] border-[#27272a]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Note */}
          <p className="text-xs text-[#52525b]">
            Tu aviso estará visible por 30 días. Solo tripulaciones verificadas podrán verlo.
          </p>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#27272a]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white"
            >
              {isLoading ? 'Publicando...' : 'Publicar Aviso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
