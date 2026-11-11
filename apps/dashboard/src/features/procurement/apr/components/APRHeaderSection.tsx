/**
 * APR Header Section Components
 * Matches the updated design:
 * 1. APRIdentityBanner: Soft purple card with title, status pill, description, copyable ID
 * 2. APRDetailsEntitiesGrid: 2-column cards with blue/green circular header icons
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Check, Info, Building2, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generateAndDownloadAprDocument } from '../handlers/generateAprDocumentRequest'
import type { APRMaster } from '../types'
import { APRStatusBadge } from './APRStatusBadge'

interface APRHeaderSectionProps {
  apr: APRMaster
  context?: 'user' | 'procurement_officer'
}

export function APRIdentityBanner({ apr, context = 'user' }: APRHeaderSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    if (!apr.id) return
    navigator.clipboard.writeText(apr.id)
    setCopied(true)
    toast.success('APR ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const deficitItems = apr.consolidatedItems?.filter(
    (item) => item.isOutOfStock || (item.outOfStockQuantity && item.outOfStockQuantity > 0) || (item.deficit && item.deficit > 0)
  ) || []
  const totalDeficitUnits = deficitItems.reduce(
    (sum, item) => sum + (item.outOfStockQuantity ?? item.deficit ?? item.quantity ?? 0),
    0
  )

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#f4f2ff] via-[#f7f5ff] to-[#efeaff] border border-[#e8e3fe] dark:from-indigo-950/60 dark:via-slate-900/90 dark:to-purple-950/45 dark:border-indigo-500/25 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="space-y-1.5 min-w-0 z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-sans tracking-tight">
            {apr.aprNumber}
          </h1>
          <APRStatusBadge status={apr.status || 'Draft'} context={context} size="sm" />
          {deficitItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              PS-DBM Deficit: {deficitItems.length} {deficitItems.length === 1 ? 'item' : 'items'} ({totalDeficitUnits} units)
            </span>
          )}
        </div>
        {apr.description ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {apr.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Agency Purchase Request for consolidated procurement items.
          </p>
        )}
      </div>

      {/* Top Right Action & ID Box */}
      <div className="flex items-center gap-2 flex-shrink-0 z-10">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 dark:bg-slate-900/80 border-purple-200 dark:border-indigo-400/30 text-purple-700 dark:text-indigo-300 hover:bg-purple-50 dark:hover:bg-indigo-500/20 hover:text-purple-800 dark:hover:text-indigo-200 shadow-xs font-medium text-xs gap-1.5"
          onClick={async () => {
            if (!apr.id) return
            try {
              toast.loading('Generating APR Form No. 002 PDF...', { id: `export-apr-${apr.id}` })
              await generateAndDownloadAprDocument({
                aprId: apr.id,
                format: 'Pdf',
                filename: `APR_${apr.aprNumber || apr.id}.pdf`
              })
              toast.success('APR Form No. 002 PDF downloaded', { id: `export-apr-${apr.id}` })
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Failed to export APR PDF'
              toast.error(msg, { id: `export-apr-${apr.id}` })
            }
          }}
        >
          <Download className="h-3.5 w-3.5 text-purple-600 dark:text-indigo-400" />
          Export Form 002 (PDF)
        </Button>

        {apr.id && (
          <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/80 border border-purple-100/90 dark:border-indigo-400/25 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 select-all">
              ID: {apr.id}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
              onClick={handleCopyId}
              aria-label="Copy APR UUID to clipboard"
              title="Copy UUID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Subtle decorative background graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-48 pointer-events-none opacity-40 hidden lg:block bg-radial from-purple-200/40 dark:from-indigo-500/20 via-transparent to-transparent" />
    </div>
  )
}

export function APRDetailsEntitiesGrid({ apr }: APRHeaderSectionProps) {
  const formattedRequestDate = (() => {
    if (!apr.requestDate) return 'Aug 18, 2026'
    try {
      return format(new Date(apr.requestDate), 'MMM dd, yyyy')
    } catch {
      return String(apr.requestDate)
    }
  })()

  const detailsFields = [
    { label: 'APR Number', value: apr.aprNumber || '—' },
    { label: 'Control Number', value: apr.agencyControlNumber || '—' },
    { label: 'Account Code', value: apr.agencyAccountCode || '—' },
    { label: 'Fiscal Year', value: `FY ${apr.fiscalYear}` },
    { label: 'Request Date', value: formattedRequestDate },
  ]

  const entityFields = [
    { label: 'Procuring Entity', value: apr.procuringEntity || 'Procurement Service - DBM' },
    { label: 'Requesting Entity', value: apr.requestingEntity || '—' },
    { label: 'Requested By', value: apr.requestedBy || '—' },
    { label: 'Position', value: apr.requestedByPosition || '—' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Details Card with blue circle icon */}
      <Card className="bg-card text-card-foreground border border-border shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="py-3.5 px-6 border-b border-border/70 bg-slate-50/50 dark:bg-slate-900/40 flex flex-row items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Info className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-xs font-bold text-foreground">
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="space-y-3">
            {detailsFields.map((field, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs gap-4">
                <dt className="text-muted-foreground font-medium flex-shrink-0">
                  {field.label}
                </dt>
                <dd className="text-foreground font-bold text-right truncate font-sans">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Entities & Requestor Card with green circle icon */}
      <Card className="bg-card text-card-foreground border border-border shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="py-3.5 px-6 border-b border-border/70 bg-slate-50/50 dark:bg-slate-900/40 flex flex-row items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-xs font-bold text-foreground">
            Entities & Requestor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="space-y-3">
            {entityFields.map((field, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs gap-4">
                <dt className="text-muted-foreground font-medium flex-shrink-0">
                  {field.label}
                </dt>
                <dd className="text-foreground font-bold text-right truncate font-sans">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export function APRHeaderSection({ apr }: APRHeaderSectionProps) {
  return (
    <div className="space-y-4">
      <APRIdentityBanner apr={apr} />
    </div>
  )
}
