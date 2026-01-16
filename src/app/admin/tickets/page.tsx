'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/features/auth/hooks'
import { AdminTicketList } from '@/features/support/components'

export default function AdminTicketsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="p-4 text-center text-zinc-500">
        Cargando...
      </div>
    )
  }

  if (!user || user.role !== 'SUPERADMIN') {
    router.push('/')
    return null
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/admin/metrics')}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <AdminTicketList adminId={user.id} />
    </div>
  )
}
