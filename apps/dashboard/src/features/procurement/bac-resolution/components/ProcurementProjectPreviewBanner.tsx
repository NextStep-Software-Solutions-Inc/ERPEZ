import { useState } from 'react'
import { Building2, Wallet, FileCheck2, Lock, ChevronDown, ChevronUp, Layers, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProcurementProjectContext } from '../types'

interface ProcurementProjectPreviewBannerProps {
  context: ProcurementProjectContext
}

export function ProcurementProjectPreviewBanner({ context }: ProcurementProjectPreviewBannerProps) {
  const [showItemBreakdown, setShowItemBreakdown] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-5 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-white font-semibold text-xs px-2.5 py-0.5">
            PROCUREMENT PROJECT
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary font-medium text-xs bg-white">
            Source: {context.sourceType === 'APP_ITEM' ? 'APP Item' : 'Consolidated PR'} ({context.sourceRef})
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/80 px-2.5 py-1 rounded-md border border-default-200 shadow-2xs">
          <Lock className="h-3.5 w-3.5 text-amber-600" />
          <span>Authoritative Source Data (Read-Only)</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Project Title */}
        <div className="col-span-full">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Project Title / Description
          </span>
          <p className="mt-0.5 font-bold text-base text-default-900 leading-snug">
            {context.projectTitle}
          </p>
        </div>

        {/* Office / Implementing Unit */}
        <div className="space-y-0.5 rounded-lg bg-white/70 p-3 border border-default-200">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            Office / Implementing Unit
          </span>
          <p className="font-semibold text-sm text-default-900">{context.officeName}</p>
        </div>

        {/* Mode of Procurement */}
        <div className="space-y-0.5 rounded-lg bg-white/70 p-3 border border-default-200">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Tag className="h-3.5 w-3.5 text-blue-600" />
            Mode of Procurement
          </span>
          <p className="font-semibold text-sm text-blue-900">{context.modeOfProcurement}</p>
        </div>

        {/* Source of Fund */}
        <div className="space-y-0.5 rounded-lg bg-white/70 p-3 border border-default-200">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            Source of Fund
          </span>
          <p className="font-semibold text-sm text-emerald-900">{context.sourceOfFund}</p>
        </div>

        {/* Estimated Budget / ABC */}
        <div className="col-span-full md:col-span-1 space-y-0.5 rounded-lg bg-emerald-50 p-3 border border-emerald-200">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
            Approved Budget for the Contract (ABC)
          </span>
          <p className="font-extrabold text-xl text-emerald-700">
            ₱{context.abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Expandable Multi-Item Breakdown for Consolidated PRs */}
      {context.itemBreakdown && context.itemBreakdown.length > 0 && (
        <div className="mt-4 border-t border-primary/10 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowItemBreakdown(!showItemBreakdown)}
            className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-focus p-0 h-auto"
          >
            <Layers className="h-4 w-4" />
            <span>
              {showItemBreakdown ? 'Hide' : 'View'} Consolidated Items Breakdown ({context.itemBreakdown.length} items)
            </span>
            {showItemBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showItemBreakdown && (
            <div className="mt-3 overflow-hidden rounded-lg border border-default-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-default-50">
                    <TableHead className="w-16">Item #</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Office / Implementing Unit</TableHead>
                    <TableHead>Mode of Procurement</TableHead>
                    <TableHead>Source of Fund</TableHead>
                    <TableHead className="text-right">Estimated Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {context.itemBreakdown.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs">{item.itemNumber}</TableCell>
                      <TableCell className="text-xs text-default-800">{item.description}</TableCell>
                      <TableCell className="text-xs">{item.officeName}</TableCell>
                      <TableCell className="text-xs">{item.modeOfProcurement}</TableCell>
                      <TableCell className="text-xs">{item.sourceOfFund}</TableCell>
                      <TableCell className="text-right font-semibold text-xs text-emerald-700">
                        ₱{item.estimatedBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
