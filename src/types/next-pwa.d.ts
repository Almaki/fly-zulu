declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  interface PWAConfig {
    dest: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    scope?: string
    sw?: string
    runtimeCaching?: RuntimeCachingEntry[]
    buildExcludes?: (string | RegExp)[]
    publicExcludes?: string[]
    fallbacks?: {
      document?: string
      image?: string
      font?: string
      audio?: string
      video?: string
    }
  }

  interface RuntimeCachingEntry {
    urlPattern: RegExp | string
    handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate'
    options?: {
      cacheName?: string
      expiration?: {
        maxEntries?: number
        maxAgeSeconds?: number
      }
      networkTimeoutSeconds?: number
      cacheableResponse?: {
        statuses?: number[]
        headers?: Record<string, string>
      }
    }
  }

  function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig

  export = withPWAInit
}
