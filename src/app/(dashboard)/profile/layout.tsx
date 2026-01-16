import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Perfil',
  description: 'Administra tu perfil, notificaciones y configuracion de cuenta en FLY-ZULU.',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
