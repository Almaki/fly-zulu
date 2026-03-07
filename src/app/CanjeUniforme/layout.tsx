import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bolsa de Canje de Uniformes | FLY-ZULU',
  description: 'Intercambia prendas de uniforme con compañeros pilotos de otras bases.',
}

export default function CanjeUniformeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Forzar light mode en esta página independientemente del tema del app
    <div className="light min-h-screen" style={{ background: '#f1f5f9', colorScheme: 'light' }}>
      {children}
    </div>
  )
}
