'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Sin conexion
          </h1>
          <p className="text-muted-foreground">
            Parece que no tienes conexion a internet. Algunas funciones pueden no estar disponibles.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm font-medium text-foreground">Mientras tanto puedes:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ver datos guardados en cache</li>
            <li>• Revisar informacion descargada previamente</li>
            <li>• Esperar a recuperar la senal</li>
          </ul>
        </div>

        <Button
          onClick={handleRetry}
          className="w-full"
          variant="default"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar conexion
        </Button>

        <p className="text-xs text-muted-foreground">
          Los cambios se sincronizaran automaticamente cuando recuperes la conexion.
        </p>
      </div>
    </div>
  )
}
