import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Calendar,
  Building,
  Tag,
  Info,
  Clock,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import type { AppMaster } from '../types'

interface APPOverviewCardProps {
  app: AppMaster
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Submitted: 'bg-amber-100 text-amber-800 border-amber-200',
  'pending-review': 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Locked: 'bg-blue-100 text-blue-800 border-blue-200',
  published: 'bg-blue-100 text-blue-800 border-blue-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
}

export function APPOverviewCard({ app }: APPOverviewCardProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return 'Not yet specified'
    try {
      return new Date(dateStr).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden border-t-4 border-t-blue-600 transition-all hover:shadow-xl">
      <CardHeader className="bg-slate-50/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Annual Procurement Plan Overview</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">General plan profile and consolidation status</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">APP Number & Code</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{app.appNumber || '—'}</p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{app.appCode || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">APP Name / Title</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">{app.appName || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fiscal Year</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{app.fiscalYear || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Implementing Units</p>
              {(() => {
                const offices = Array.from(
                  new Set(
                    (app.bac?.lineItems ?? []).map((i) => i.office).filter(Boolean)
                  )
                )
                if (offices.length === 0) {
                  return <p className="text-sm text-gray-400 italic mt-1">Not specified</p>
                }
                if (offices.length === 1) {
                  return <p className="text-sm font-semibold text-gray-800 mt-1">{offices[0]}</p>
                }
                return (
                  <div className="mt-1 space-y-0.5">
                    {offices.slice(0, 3).map((o) => (
                      <p key={o} className="text-xs text-gray-700">{o}</p>
                    ))}
                    {offices.length > 3 && (
                      <p className="text-xs text-gray-400 italic">+{offices.length - 3} more</p>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan Status & Type</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                  {app.status}
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {app.appType || 'Indicative'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created By & On</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{app.createdBy || 'Authorized User'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(app.createdAt)}</p>
            </div>
          </div>

          <div className="md:col-span-2 flex items-start gap-3 border-t border-gray-100 pt-4">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</p>
              <p className="text-sm text-gray-700 mt-1">{app.description || 'No description available for this plan.'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-gray-100 pt-4">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeline</p>
              <p className="text-xs text-gray-600 mt-1">Submitted: <span className="font-medium text-gray-800">{formatDate(app.submittedDate)}</span></p>
              <p className="text-xs text-gray-600 mt-0.5">Approved: <span className="font-medium text-gray-800">{formatDate(app.approvedDate)}</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
