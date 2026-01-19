'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Star, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { DIRECTORY_CATEGORIES } from '@/shared/constants'
import { directoryEntrySchema, type DirectoryEntryFormData, type DirectoryEntry } from '../types'
import { createDirectoryEntry, updateDirectoryEntry } from '../services'

interface DirectoryEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntry?: DirectoryEntry | null
  defaultAirport?: string
  onSuccess?: () => void
}

// Star rating component
function StarRating({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-[#f59e0b] text-[#f59e0b]'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
      <span className="text-xs text-zinc-500 ml-2">
        {value > 0 ? `${value} estrella${value > 1 ? 's' : ''}` : 'Tu calificación'}
      </span>
    </div>
  )
}

// Fire confetti celebration
function celebrateSuccess() {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export function DirectoryEntryForm({
  open,
  onOpenChange,
  editEntry,
  defaultAirport,
  onSuccess,
}: DirectoryEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const isEditing = !!editEntry

  const form = useForm<DirectoryEntryFormData>({
    resolver: zodResolver(directoryEntrySchema),
    defaultValues: {
      airport_code: editEntry?.airport_code || defaultAirport || '',
      category: editEntry?.category || '',
      name: editEntry?.name || '',
      description: editEntry?.description || '',
      phone: editEntry?.phone || '',
      whatsapp: editEntry?.whatsapp || '',
      address: editEntry?.address || '',
    },
  })

  // Reset form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      form.reset({
        airport_code: editEntry.airport_code,
        category: editEntry.category,
        name: editEntry.name,
        description: editEntry.description || '',
        phone: editEntry.phone || '',
        whatsapp: editEntry.whatsapp || '',
        address: editEntry.address || '',
      })
    } else {
      form.reset({
        airport_code: defaultAirport || '',
        category: '',
        name: '',
        description: '',
        phone: '',
        whatsapp: '',
        address: '',
      })
    }
  }, [editEntry, defaultAirport, form])

  async function onSubmit(data: DirectoryEntryFormData) {
    setIsLoading(true)

    try {
      // Add initial rating if provided
      const submitData = {
        ...data,
        initial_rating: rating > 0 ? rating : undefined,
      }

      console.log('Submitting directory entry:', submitData)

      const result = isEditing
        ? await updateDirectoryEntry(editEntry!.id, submitData)
        : await createDirectoryEntry(submitData)

      console.log('Server action result:', result)

      if (result.error) {
        console.error('Server returned error:', result.error)
        toast.error(result.error)
        return
      }

      // Fire confetti for new entries
      if (!isEditing) {
        celebrateSuccess()
        toast.success('¡Gracias por colaborar! 🎉')
      } else {
        toast.success('Contacto actualizado')
      }

      onOpenChange(false)
      form.reset()
      setRating(0)
      onSuccess?.()
    } catch (err) {
      console.error('Unexpected error in form submit:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al guardar'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-zinc-800 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#fafafa]">
            {isEditing ? 'Editar contacto' : 'Agregar contacto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Airport & Category */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="airport_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 text-xs">Aeropuerto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MEX"
                        maxLength={3}
                        className="bg-zinc-900 border-zinc-700 uppercase"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 text-xs">Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIRECTORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Hotel Fiesta Inn Aeropuerto"
                      className="bg-zinc-900 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs">Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Descuento 15% para tripulación"
                      className="bg-zinc-900 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp (Primary) */}
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="52 55 1234 5678"
                      className="bg-zinc-900 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone (Optional) */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs">Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="55 1234 5678"
                      className="bg-zinc-900 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs">Dirección (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Blvd. Puerto Aéreo 380"
                      className="bg-zinc-900 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Star Rating (only for new entries) */}
            {!isEditing && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <Label className="text-zinc-400 text-xs">¿Qué tan bueno es? (opcional)</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Actualizar'
                ) : (
                  'Agregar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
