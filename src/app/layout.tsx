import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/shared/components/ui/sonner'
import { ThemeProvider } from '@/shared/components/theme-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fly-zulu.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'FLY-ZULU | Tu base de operaciones',
    template: '%s | FLY-ZULU',
  },
  description: 'PWA para tripulaciones de aviacion en Mexico. FIDS, Directorio, Logbook y Academy.',
  keywords: ['aviacion', 'pilotos', 'sobrecargos', 'FIDS', 'vuelos', 'Mexico', 'tripulacion'],
  authors: [{ name: 'FLY-ZULU' }],
  creator: 'FLY-ZULU',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: APP_URL,
    siteName: 'FLY-ZULU',
    title: 'FLY-ZULU | Tu base de operaciones',
    description: 'PWA para tripulaciones de aviacion en Mexico. FIDS, Directorio, Logbook y Academy.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'FLY-ZULU - Tu base de operaciones',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLY-ZULU | Tu base de operaciones',
    description: 'PWA para tripulaciones de aviacion en Mexico',
    images: ['/og-image.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FLY-ZULU',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E91E8C',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
