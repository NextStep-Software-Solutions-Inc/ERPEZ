/**
 * APR Header Section Component
 * Displays prominent APR identity, status, metadata, and requestor info
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { APRStatusBadge } from './APRStatusBadge'
import type { APRMaster } from '../types'

interface APRHeaderSectionProps {
  apr: APRMaster
}

export function APRHeaderSection({ apr }: APRHeaderSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    if (!apr.id) return
    navigator.clipboard.writeText(apr.id)
    setCopied(true)
    toast.success('APR ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedRequestDate = (() => {
    if (!apr.requestDate) return '—'
    try {
      return format(new Date(apr.requestDate), 'MMM dd, yyyy')
    } catch {
      return String(apr.requestDate)
    }
  })()

  const headerFields = [
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
    <div className="space-y-4">
      {/* Primary APR Identity Banner */}
      <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-mono">
              {apr.aprNumber}
            </h1>
            <APRStatusBadge status={apr.status} size="lg" />
          </div>
          {apr.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {apr.description}
            </p>
          )}
        </div>

        {/* Secondary UUID snippet */}
        {apr.id && (
          <div className="flex items-center gap-1.5 flex-shrink-0 self-start md:self-center">
            <span className="text-xs font-mono text-muted-foreground bg-slate-50 border px-2.5 py-1 rounded-md max-w-[180px] sm:max-w-none truncate">
              ID: {apr.id}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-gray-900"
              onClick={handleCopyId}
              title="Copy UUID"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Two Column Summary Grid: Details + Entities & Requestor */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* APR Details */}
        <Card className="shadow-xs border-gray-200">
          <CardHeader className="py-3 px-5 border-b bg-slate-50/50">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <dl className="space-y-2.5">
              {headerFields.map((field, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs gap-4">
                  <dt className="text-muted-foreground font-medium flex-shrink-0">
                    {field.label}
                  </dt>
                  <dd className="text-gray-900 font-semibold text-right truncate">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Entities & Requestor */}
        <Card className="shadow-xs border-gray-200">
          <CardHeader className="py-3 px-5 border-b bg-slate-50/50">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entities & Requestor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <dl className="space-y-2.5">
              {entityFields.map((field, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs gap-4">
                  <dt className="text-muted-foreground font-medium flex-shrink-0">
                    {field.label}
                  </dt>
                  <dd className="text-gray-900 font-semibold text-right truncate">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
