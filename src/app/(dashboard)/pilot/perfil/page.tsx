'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Briefcase, Edit2, Check, X, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { createClient } from '@/shared/lib/supabase/client'
import { useAuthStore } from '@/features/auth/store'

export default function PerfilPage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (user) {
      setNewName(user.nombre)
    }
  }, [user])

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres')
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('users') as any)
        .update({ nombre: newName.trim() })
        .eq('id', user?.id)

      if (error) {
        toast.error('Error al actualizar el nombre')
        return
      }

      if (user) {
        setUser({ ...user, nombre: newName.trim() })
      }
      setIsEditing(false)
      toast.success('Nombre actualizado')
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      logout()
      router.push('/login')
    } catch {
      toast.error('Error al cerrar sesión')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      PILOT: 'Piloto',
      FA: 'Sobrecargo',
      OPS: 'Operaciones',
      TRAFICO: 'Tráfico',
      MANTTO: 'Mantenimiento',
      SUPERADMIN: 'Super Admin',
    }
    return labels[position] || position
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <h1 className="text-2xl font-bold text-[#fafafa]">Mi Perfil</h1>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-[#27272a] bg-[#141414] p-6 space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066CC] to-[#0088FF] flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Name Field (Editable) */}
          <div className="space-y-2">
            <label className="text-xs text-[#71717a] uppercase tracking-wide flex items-center gap-2">
              <User className="w-3 h-3" />
              Nombre
            </label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="text-[#22c55e] hover:text-[#22c55e] hover:bg-[#22c55e]/10"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setNewName(user.nombre)
                  }}
                  className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[#fafafa] font-medium">{user.nombre}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-[#71717a] hover:text-[#fafafa]"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-[#71717a] uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <p className="text-[#a1a1aa]">{user.email}</p>
          </div>

          {/* WhatsApp Field (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-[#71717a] uppercase tracking-wide flex items-center gap-2">
              <Phone className="w-3 h-3" />
              WhatsApp
            </label>
            <p className="text-[#a1a1aa]">{user.whatsapp}</p>
          </div>

          {/* Position Field (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-[#71717a] uppercase tracking-wide flex items-center gap-2">
              <Briefcase className="w-3 h-3" />
              Posición
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0066CC]/20 text-[#0066CC] text-sm font-medium">
                {getPositionLabel(user.posicion)}
              </span>
              <span className="text-xs text-[#71717a]">({user.categoria})</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
