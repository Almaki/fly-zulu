import { SecurityChecklist, IncidentForm } from '@/features/fa/components'

export default function FASecurityPage() {
  return (
    <div className="space-y-4">
      <SecurityChecklist />
      <IncidentForm />
    </div>
  )
}
