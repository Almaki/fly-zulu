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
    <div className="light min-h-screen flex flex-col" style={{ background: '#f1f5f9', colorScheme: 'light' }}>
      <div className="flex-1">{children}</div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-4 px-4 text-center space-y-3">
        <a
          href="https://fly-zulu.com/home"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          ← Ir al Home
        </a>
        <p className="text-slate-500 text-xs leading-relaxed">
          Visita{' '}
          <a
            href="https://fly-zulu.com"
            className="text-sky-600 font-semibold hover:underline"
          >
            www.fly-zulu.com
          </a>
          , crea tu cuenta y conoce todas las opciones disponibles.
        </p>
      </footer>
    </div>
  )
}
