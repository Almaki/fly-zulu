import { Header, BottomNav, SyncIndicator, AdminGlow } from '@/shared/components'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminGlow />
      <SyncIndicator />
      <Header />
      <main className="flex-1 pb-nav">
        <div className="max-w-[500px] mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
