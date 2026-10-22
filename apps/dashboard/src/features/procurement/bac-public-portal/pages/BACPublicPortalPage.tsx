import { useSearch, useNavigate } from '@tanstack/react-router'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BACPublicPortalLanding } from '../components/BACPublicPortalLanding'
import { BACProjectDetail } from '../components/BACProjectDetail'
import { usePublicProject } from '../hooks/usePublicPortalApi'

export function BACPublicPortalPage() {
  const search = useSearch({ strict: false }) as { projectId?: string }
  const navigate = useNavigate()

  const {
    data: project,
    isLoading,
    error,
  } = usePublicProject(search.projectId)

  if (search.projectId) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading project details...</p>
        </div>
      )
    }

    if (error || !project) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
            <p className="text-sm text-slate-500 max-w-md">
              {error instanceof Error ? error.message : 'The requested procurement project could not be found or is no longer available.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/v2/bac', search: { projectId: undefined } })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Button>
        </div>
      )
    }

    return (
      <BACProjectDetail
        project={project}
        onBack={() => navigate({ to: '/v2/bac', search: { projectId: undefined } })}
      />
    )
  }

  return (
    <BACPublicPortalLanding
      onViewProject={(p) => navigate({ to: '/v2/bac', search: { projectId: p.id } })}
    />
  )
}
