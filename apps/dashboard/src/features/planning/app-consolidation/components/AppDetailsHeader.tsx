import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { ProgressBadge } from './ProgressBadge'
import type { AppMaster } from '../types'

const statusColors: Record<string, string> = {
  Draft:     'bg-slate-100 text-slate-800 border-slate-300',
  Submitted: 'bg-amber-100 text-amber-900 border-amber-300',
  Approved:  'bg-emerald-100 text-emerald-900 border-emerald-300',
  Locked:    'bg-blue-100 text-blue-900 border-blue-300',
  Returned:  'bg-rose-100 text-rose-900 border-rose-300',
}

interface AppDetailsHeaderProps {
  app: AppMaster
}

export function AppDetailsHeader({ app }: AppDetailsHeaderProps) {
  const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted for Review',
    Approved: 'Approved',
    Locked: 'Locked',
    Returned: 'Returned for Revision',
  }
  const statusLabel = statusLabels[app.status] ?? app.status
  
  const itemCount = app.aggregationResults?.items?.reduce((sum, item) => sum + item.items.length, 0) || 0
  const hasSignatories = app.signatories && (
    (app.signatories.preparedBy?.length ?? 0) > 0 ||
    (app.signatories.reviewedBy?.length ?? 0) > 0 ||
    (app.signatories.approvedBy?.length ?? 0) > 0 ||
    (app.signatories.certifiedBy?.length ?? 0) > 0
  )

  const appTypeStr = app.appType || 'Indicative'
  const isUpdated = appTypeStr === 'Updated'

  // Clean title without repetitive clutter if title contains parenthetical version noise
  const displayTitle = app.appName ? app.appName.replace(/\s*\([^)]*\)/g, '').trim() || app.appName : 'Annual Procurement Plan'

  return (
    <Card className="border border-slate-200/90 border-t-4 border-t-purple-600 shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Title & Status - Semibold / 600 weight for executive clarity */}
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 break-words">
                {displayTitle}
              </h1>
              <Badge className={`${statusColors[app.status] || 'bg-slate-100 text-slate-800'} text-xs font-semibold px-3 py-1 border`}>
                {statusLabel}
              </Badge>
            </div>

            {/* Structured Metadata Badges - Readable & High Contrast */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                FY {app.fiscalYear}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200">
                Type: {appTypeStr}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {app.batch || 'Batch 1'}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {app.quarter || 'Q1'}
              </span>
              {isUpdated && (
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  Version {app.versionNumber || 1} {app.versionDate ? `• ${app.versionDate}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 pt-1">
              <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Code: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{app.appCode}</span>
              </p>
              <ProgressBadge 
                itemsAdded={itemCount}
                bacConfigured={(app.bac?.lineItems?.length ?? 0) > 0}
                signatoriesAdded={hasSignatories}
              />
            </div>
          </div>

          {/* APP Number Badge Box */}
          <div className="text-left md:text-right bg-slate-50/90 rounded-lg p-3.5 border border-slate-200 shrink-0">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">APP Number</p>
            <p className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-0.5">{app.appNumber}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
