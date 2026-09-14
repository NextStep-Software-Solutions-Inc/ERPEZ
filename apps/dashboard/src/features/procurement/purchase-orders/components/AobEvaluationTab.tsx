import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Layers,
  Printer,
  ExternalLink,
  Info,
  Scale,
  Hash,
  Calendar,
  User,
  Users,
  CheckCircle2,
  Award,
  Download,
  Loader2,
} from 'lucide-react'
import { BidEvaluationMatrix } from '@/features/procurement/aob/tables/BidEvaluationMatrix'
import { ItemBidDetailsTable } from '@/features/procurement/aob/tables/ItemBidDetailsTable'
import { printAOB } from '@/features/procurement/aob/utils/printAOB'
import type { AOB, BidMatrix } from '@/features/procurement/aob/types/aobTypes'
import { toast } from 'sonner'

export interface AobEvaluationTabProps {
  aob: AOB | null | undefined
  bidMatrix: BidMatrix | null | undefined
  isLoading?: boolean
  sourceDocumentNumber?: string | null
}

export function AobEvaluationTab({
  aob,
  bidMatrix,
  isLoading = false,
  sourceDocumentNumber,
}: AobEvaluationTabProps) {
  const [subView, setSubView] = useState<'matrix' | 'summary'>('matrix')

  const stats = useMemo(() => {
    if (!bidMatrix) {
      return {
        totalLineItems: 0,
        totalSuppliers: 0,
        responsiveBids: 0,
        awardedAmount: 0,
      }
    }

    let responsiveBids = 0
    let awardedAmount = 0
    const totalLineItems = bidMatrix.lineItems?.length || 0
    const totalSuppliers = bidMatrix.suppliers?.length || 0

    bidMatrix.lineItems?.forEach((item) => {
      item.lineItems?.forEach((bid) => {
        if (bid.isWinner && bid.totalBid) {
          awardedAmount += bid.totalBid
        }
        if (bid.unitBid) {
          responsiveBids++
        }
      })
    })

    return {
      totalLineItems,
      totalSuppliers,
      responsiveBids,
      awardedAmount,
    }
  }, [bidMatrix])

  const flatBids = useMemo(() => {
    if (!bidMatrix?.lineItems) return []
    return bidMatrix.lineItems.flatMap((item) => item.lineItems || [])
  }, [bidMatrix])

  const handlePrint = () => {
    if (!aob) return
    printAOB(aob, bidMatrix)
  }

  const handleExport = () => {
    toast.info('Export functionality triggered for Abstract of Bids.')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-sm">Loading Abstract of Bids details ({sourceDocumentNumber || 'AOB'})...</span>
      </div>
    )
  }

  if (!aob) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="py-12 text-center text-sm text-muted-foreground space-y-2">
          <Layers className="h-10 w-10 mx-auto text-slate-400 opacity-60" />
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Unable to load linked AOB ({sourceDocumentNumber || 'No record ID'}).
          </p>
          <p className="text-xs text-muted-foreground">
            The source Abstract of Bids document might have been moved or is currently unavailable.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AOB Summary Banner Card */}
      <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-slate-950 border-l-4 border-l-amber-500">
        <CardHeader className="pb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/50 dark:border-amber-900/30">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {aob.aobNumber}
                    </CardTitle>
                    <Badge
                      variant="soft"
                      className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                      {aob.status}
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 font-medium">
                      {aob.awardCriterion || 'LCRB'}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {aob.description || 'Abstract of Bids Canvass and Supplier Evaluation'}
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                Print AOB
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                Export
              </Button>
              {aob.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-500/20 font-medium"
                  asChild
                >
                  <Link
                    to="/v2/abstract-of-bids-aob/$aobId"
                    params={{ aobId: aob.id }}
                  >
                    Open in AOB Module
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 pb-5">
          {/* Metadata Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* RFQ Number */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Hash className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                RFQ Number
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                {aob.rfqNumber || '—'}
              </p>
            </div>

            {/* Award Criterion */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Scale className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Criterion
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {aob.awardCriterion || 'LCRB'}
              </p>
            </div>

            {/* Created Date */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Date Evaluated
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {aob.createdAt ? new Date(aob.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>

            {/* Evaluated By */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Evaluated By
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                {aob.createdBy || 'System'}
              </p>
            </div>

            {/* Participating Suppliers */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Suppliers
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {stats.totalSuppliers} vendor{stats.totalSuppliers !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Responsive Bids */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Award className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                Responsive Bids
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {stats.responsiveBids} bid{stats.responsiveBids !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-toggle Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setSubView('matrix')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${subView === 'matrix'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Supplier Bid Matrix
          </button>
          <button
            type="button"
            onClick={() => setSubView('summary')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${subView === 'summary'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Award Decision Summary
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          {stats.totalLineItems} item{stats.totalLineItems !== 1 ? 's' : ''} evaluated across {stats.totalSuppliers} supplier{stats.totalSuppliers !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sub-View Content */}
      {subView === 'matrix' ? (
        bidMatrix && bidMatrix.lineItems && bidMatrix.lineItems.length > 0 ? (
          <div className="space-y-4">
            <BidEvaluationMatrix bidMatrix={bidMatrix} />
          </div>
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  No bid data available yet. Ensure RFQs are linked to this Abstract of Bids to populate the evaluation matrix.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {bidMatrix?.lineItems && bidMatrix.lineItems.length > 0 ? (
            <ItemBidDetailsTable
              lineItems={bidMatrix.lineItems}
              bids={flatBids}
              variant="detailed"
            />
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    No award summary data available yet.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
