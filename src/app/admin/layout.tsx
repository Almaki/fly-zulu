import { Header, BottomNav } from '@/shared/components'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Admin glow effect - purple/magenta border */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 border-[3px] border-transparent rounded-none"
          style={{
            boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 40px rgba(168, 85, 247, 0.2)',
            borderImage: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.6), rgba(168, 85, 247, 0.6)) 1',
          }}
        />
        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-500/70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-500/70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-pink-500/70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-pink-500/70" />
        {/* Admin badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
          <span className="text-[9px] font-medium text-purple-400 tracking-wider uppercase">Admin Mode</span>
        </div>
      </div>
      <Header />
      <main className="flex-1 pb-nav">
        <div className="max-w-[500px] mx-auto px-4 py-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
