import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getDirectoryEntryById } from '@/features/directory/services'
import { DIRECTORY_CATEGORIES } from '@/shared/constants'
import { DirectoryEntryDetail } from '@/features/directory/components/directory-entry-detail'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data: entry } = await getDirectoryEntryById(id)

  if (!entry) {
    return {
      title: 'Servicio no encontrado',
    }
  }

  const category = DIRECTORY_CATEGORIES.find((c) => c.id === entry.category)
  const title = `${entry.name} - ${entry.airport_code}`
  const description = entry.description || `${category?.label || 'Servicio'} en ${entry.airport_code}. App colaborativa para tripulaciones.`

  return {
    title,
    description,
    openGraph: {
      title: `${entry.name} | FLY-ZULU`,
      description,
      type: 'website',
      images: ['/icons/icon-512x512.png'],
    },
    twitter: {
      card: 'summary',
      title: `${entry.name} | FLY-ZULU`,
      description,
      images: ['/icons/icon-512x512.png'],
    },
  }
}

export default async function DirectoryEntryPage({ params }: PageProps) {
  const { id } = await params
  const { data: entry, error } = await getDirectoryEntryById(id)

  if (error || !entry) {
    notFound()
  }

  return <DirectoryEntryDetail entry={entry} />
}
