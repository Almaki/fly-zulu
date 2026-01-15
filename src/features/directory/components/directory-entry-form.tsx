'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
  entry?: DirectoryEntry | null
  defaultAirport?: string
  onSuccess?: () => void
}

export function DirectoryEntryForm({
  open,
  onOpenChange,
  entry,
  defaultAirport,
  onSuccess,
}: DirectoryEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!entry

  const form = useForm<DirectoryEntryFormData>({
    resolver: zodResolver(directoryEntrySchema),
    defaultValues: {
      airport_code: entry?.airport_code || defaultAirport || '',
      category: entry?.category || '',
      name: entry?.name || '',
      description: entry?.description || '',
      phone: entry?.phone || '',
      whatsapp: entry?.whatsapp || '',
      address: entry?.address || '',
    },
  })

  async function onSubmit(data: DirectoryEntryFormData) {
    setIsLoading(true)

    try {
      const result = isEditing
        ? await updateDirectoryEntry(entry.id, data)
        : await createDirectoryEntry(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? 'Contacto actualizado' : 'Contacto agregado')
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch {
      toast.error('Error al guardar contacto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-zinc-800 max-w-md">
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

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 text-xs">Teléfono</FormLabel>
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

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 text-xs">WhatsApp (opcional)</FormLabel>
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
            </div>

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
