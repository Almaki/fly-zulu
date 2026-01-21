import type { Metadata } from 'next'
import { InviteUserForm } from '@/features/admin/components'

export const metadata: Metadata = {
  title: 'Invitar Usuarios - Admin',
  description: 'Envía invitaciones y genera magic links para usuarios',
  robots: { index: false, follow: false }
}

export default function AdminInvitesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invitar Usuarios</h1>
        <p className="text-zinc-400 mt-1">
          Envía invitaciones a nuevos usuarios o genera links de acceso
        </p>
      </div>

      <InviteUserForm />
    </div>
  )
}
