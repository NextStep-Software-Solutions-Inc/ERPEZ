import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { ProgressBadge } from './ProgressBadge'
import type { AppMaster } from '../types'

const statusColors: Record<string, string> = {
  Draft:     'bg-gray-100 text-gray-800',
  Submitted: 'bg-amber-100 text-amber-800',
  Approved:  'bg-green-100 text-green-800',
  Locked:    'bg-blue-100 text-blue-800',
  Returned:  'bg-red-100 text-red-800',
}

const statusBgColors: Record<string, string> = {
  Draft:     'bg-gray-50 border-gray-200',
  Submitted: 'bg-amber-50 border-amber-200',
  Approved:  'bg-green-50 border-green-200',
  Locked:    'bg-blue-50 border-blue-200',
  Returned:  'bg-red-50 border-red-200',
}

interface AppDetailsHeaderProps {
  app: AppMaster
}

export function AppDetailsHeader({ app }: AppDetailsHeaderProps) {
  const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
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

  return (
    <Card className={`border-0 shadow-md rounded-lg overflow-hidden bg-gradient-to-br ${statusBgColors[app.status] || 'bg-gray-50 border-gray-200'}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
      <CardHeader className="relative pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {app.appName}
              </h1>
              <Badge className={`${statusColors[app.status] || 'bg-gray-100 text-gray-800'} text-sm font-semibold px-4 py-1 shadow-md`}>
                {statusLabel}
              </Badge>
            </div>

            {/* Compact Metadata Row */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                FY {app.fiscalYear}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Type: {appTypeStr}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {app.batch || 'Batch 1'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                {app.quarter || 'Q1'}
              </span>
              {isUpdated && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Version {app.versionNumber || 1} {app.versionDate ? `• ${app.versionDate}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Code: <span className="font-mono font-semibold text-gray-800 bg-white/60 px-3 py-1 rounded-md">{app.appCode}</span>
              </p>
              <ProgressBadge 
                itemsAdded={itemCount}
                bacConfigured={(app.bac?.lineItems?.length ?? 0) > 0}
                signatoriesAdded={hasSignatories}
              />
            </div>
          </div>
          <div className="text-right bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">APP Number</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{app.appNumber}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
