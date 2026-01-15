'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type ConnectionStatus = 'online' | 'offline' | 'syncing'

interface SyncIndicatorProps {
  pendingCount?: number
}

export function SyncIndicator({ pendingCount = 0 }: SyncIndicatorProps) {
  const [status, setStatus] = useState<ConnectionStatus>('online')

  useEffect(() => {
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline')
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  // Override with syncing status if there are pending items and online
  const displayStatus = pendingCount > 0 && status === 'online' ? 'syncing' : status

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        displayStatus === 'online' && 'bg-green-500/20 text-green-400',
        displayStatus === 'offline' && 'bg-red-500/20 text-red-400',
        displayStatus === 'syncing' && 'bg-yellow-500/20 text-yellow-400'
      )}
    >
      {displayStatus === 'online' && (
        <>
          <Wifi className="h-3 w-3" />
          <span>Sincronizado</span>
        </>
      )}

      {displayStatus === 'offline' && (
        <>
          <WifiOff className="h-3 w-3" />
          <span>{pendingCount > 0 ? `Offline - ${pendingCount} pendientes` : 'Offline'}</span>
        </>
      )}

      {displayStatus === 'syncing' && (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Sincronizando... ({pendingCount})</span>
        </>
      )}
    </div>
  )
}
