export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-[390px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00ff88] mb-2">FLY-ZULU</h1>
          <p className="text-zinc-400 text-sm">Tu base de operaciones</p>
        </div>
        {children}
      </div>
    </div>
  )
}
