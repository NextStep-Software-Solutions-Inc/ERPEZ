import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { AppMaster } from '../types'

interface APPOverviewCardProps {
  app: AppMaster
}

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-800 border-slate-300',
  draft: 'bg-slate-100 text-slate-800 border-slate-300',
  Submitted: 'bg-amber-100 text-amber-900 border-amber-300',
  'pending-review': 'bg-amber-100 text-amber-900 border-amber-300',
  Approved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  Locked: 'bg-blue-100 text-blue-900 border-blue-300',
  published: 'bg-blue-100 text-blue-900 border-blue-300',
  Rejected: 'bg-rose-100 text-rose-900 border-rose-300',
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

  const offices = Array.from(
    new Set(
      (app.bac?.lineItems ?? []).map((i) => i.office).filter(Boolean)
    )
  )

  const itemCount = app.aggregationResults?.items?.reduce((sum, item) => sum + item.items.length, 0) || app.bac?.lineItems?.length || 0
  const ppmpSourceCount = app.ppmpIds?.length || app.appPpmps?.length || 0
  const totalBudget = app.aggregationResults?.totalAmount ?? app.bac?.totalBudget ?? 0

  return (
    <Card className="border border-slate-200 shadow-xs bg-white rounded-xl overflow-hidden">
      {/* Executive Header Banner */}
      <CardHeader className="bg-slate-50/80 border-b border-slate-200 py-4 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700 border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 leading-tight">
                Annual Procurement Plan Overview
              </CardTitle>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Executive summary and consolidation metadata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-semibold">
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-xs border ${
                statusColors[app.status] || 'bg-slate-100 text-slate-800'
              }`}
            >
              {app.status}
            </span>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-xs bg-purple-50 text-purple-800 border border-purple-200">
              {app.appType || 'Indicative'}
            </span>
            <span className="inline-flex items-center rounded-md px-3 py-1 text-xs bg-blue-50 text-blue-800 border border-blue-200">
              FY {app.fiscalYear}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-200">
          {/* Fiscal Year */}
          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/70 space-y-1">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
              Fiscal Year
            </span>
            <span className="text-lg font-bold text-blue-950">
              FY {app.fiscalYear}
            </span>
          </div>

          {/* Number of Items */}
          <div className="p-3.5 rounded-lg bg-purple-50/70 border border-purple-200/70 space-y-1">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider block">
              Line Items
            </span>
            <span className="text-lg font-bold text-purple-950">
              {itemCount} items
            </span>
          </div>

          {/* PPMP Sources */}
          <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/70 space-y-1">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              PPMP Sources
            </span>
            <span className="text-lg font-bold text-amber-950">
              {ppmpSourceCount} sources
            </span>
          </div>

          {/* Total Budget */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 space-y-1">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Budget
            </span>
            <span className="text-lg font-bold text-emerald-950">
              ₱{totalBudget.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Grouped Secondary Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Identifiers */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              APP Identifiers
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {app.appNumber || '—'}
            </p>
            <p className="text-slate-600 text-xs font-medium">
              {app.appCode || '—'}
            </p>
          </div>

          {/* Implementing Units */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Implementing Units
            </span>
            {offices.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Not specified</p>
            ) : (
              <div className="space-y-0.5 text-xs font-semibold text-slate-800">
                {offices.slice(0, 2).map((o) => (
                  <p key={o} className="truncate" title={o}>{o}</p>
                ))}
                {offices.length > 2 && (
                  <p className="text-slate-500 italic font-normal">+{offices.length - 2} more</p>
                )}
              </div>
            )}
          </div>

          {/* Created By & Date */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Created By & Date
            </span>
            <p className="text-xs font-semibold text-slate-900">
              {app.createdBy || 'Authorized User'}
            </p>
            <p className="text-xs text-slate-600">{formatDate(app.createdAt)}</p>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
              Timeline Milestones
            </span>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Submitted:</span>
                <span className="font-semibold text-slate-900">{formatDate(app.submittedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Approved:</span>
                <span className="font-semibold text-slate-900">{formatDate(app.approvedDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scope Note */}
        {app.description && (
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Description / Scope Note
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200">
              {app.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
