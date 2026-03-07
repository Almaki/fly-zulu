'use client'

import { useCanje } from '@/features/canje-uniforme/hooks/useCanje'
import { PageHeader } from '@/features/canje-uniforme/components/PageHeader'
import { EntradaPiloto } from '@/features/canje-uniforme/components/EntradaPiloto'
import { BannerPiloto } from '@/features/canje-uniforme/components/BannerPiloto'
import { FormPublicacion } from '@/features/canje-uniforme/components/FormPublicacion'
import { AlertaMatch } from '@/features/canje-uniforme/components/AlertaMatch'
import { Tablero } from '@/features/canje-uniforme/components/Tablero'
import { ChatModal } from '@/features/canje-uniforme/components/ChatModal'
import { ResumenInventario } from '@/features/canje-uniforme/components/ResumenInventario'

export default function CanjeUniformePage() {
  const {
    publicaciones,
    matches,
    misMatchIds,
    misPubs,
    piloto,
    cargando,
    chatAbierto,
    entrarComoPiloto,
    salirSesion,
    publicar,
    resolverMatch,
    retirar,
    cancelarMatch,
    abrirChat,
    cerrarChat,
  } = useCanje()

  return (
    <div className="max-w-lg mx-auto px-4 py-5 pb-10">
      <PageHeader />

      {!piloto ? (
        <EntradaPiloto onEntrar={entrarComoPiloto} />
      ) : (
        <>
          <BannerPiloto piloto={piloto} misPubs={misPubs.length} onSalir={salirSesion} />

          {/* Alertas de matches — misma base primero */}
          <AlertaMatch matches={matches} numeroRol={piloto.numero_rol} onAbrirChat={abrirChat} />

          <FormPublicacion onPublicar={publicar} />
        </>
      )}

      {!cargando && publicaciones.length > 0 && (
        <ResumenInventario publicaciones={publicaciones} />
      )}

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
        <h2 className="text-slate-700 font-bold text-base mb-4 flex items-center gap-2">
          <span>📋</span>
          Tablero General
          {cargando ? (
            <span className="text-xs text-slate-400 font-normal animate-pulse">Cargando...</span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">
              · {publicaciones.length} publicación{publicaciones.length !== 1 ? 'es' : ''}
            </span>
          )}
        </h2>
        {cargando ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Tablero
            publicaciones={publicaciones}
            matches={matches}
            misMatchIds={piloto ? misMatchIds : new Set()}
            numeroRol={piloto?.numero_rol ?? ''}
            onRetirar={retirar}
            onResolver={resolverMatch}
            onAbrirChat={abrirChat}
            onCancelarMatch={cancelarMatch}
          />
        )}
      </div>

      {/* Chat derivado en vivo — nunca stale */}
      {chatAbierto && piloto && (
        <ChatModal
          match={chatAbierto}
          numeroRol={piloto.numero_rol}
          onCerrar={cerrarChat}
          onResolver={resolverMatch}
        />
      )}
    </div>
  )
}
