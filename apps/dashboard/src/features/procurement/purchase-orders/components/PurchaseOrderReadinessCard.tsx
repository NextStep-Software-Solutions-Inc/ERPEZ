import React from 'react'
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Send,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder } from '../types'
import { formatCurrency } from '../utils/printPurchaseOrder'

interface PurchaseOrderReadinessCardProps {
  purchaseOrder: PurchaseOrder
  onOpenSubmit?: () => void
  onOpenApprove?: () => void
  onOpenReturn?: () => void
  isSubmitting?: boolean
  canSubmit?: boolean
  canForApproval?: boolean
}

export const PurchaseOrderReadinessCard: React.FC<PurchaseOrderReadinessCardProps> = ({
  purchaseOrder,
  onOpenSubmit,
  onOpenApprove,
  onOpenReturn,
  isSubmitting = false,
  canSubmit = false,
  canForApproval = false,
}) => {
  const statusLower = (purchaseOrder.status || 'draft').toLowerCase().replace(/[-_]/g, '')
  const lineItems = purchaseOrder.lineItems ?? purchaseOrder.items ?? []
  const totalAmount =
    purchaseOrder.totalAmount > 0
      ? purchaseOrder.totalAmount
      : lineItems.reduce((acc, it) => acc + (it.amount || it.quantity * it.unitPrice || 0), 0)

  // Validation checks
  const errors: string[] = []
  const passedChecks: string[] = []

  if (!purchaseOrder.supplierName || purchaseOrder.supplierName.trim() === '' || purchaseOrder.supplierName === '—') {
    errors.push('Winning supplier must be selected')
  } else {
    passedChecks.push(`Supplier: ${purchaseOrder.supplierName}`)
  }

  if (lineItems.length === 0) {
    errors.push('At least one line item is required')
  } else {
    passedChecks.push(`${lineItems.length} line item${lineItems.length !== 1 ? 's' : ''} specified`)
  }

  if (totalAmount <= 0) {
    errors.push('Total amount must be greater than zero')
  } else {
    passedChecks.push(`Total Amount: ${formatCurrency(totalAmount)}`)
  }

  if (purchaseOrder.placeOfDelivery) {
    passedChecks.push(`Delivery: ${purchaseOrder.placeOfDelivery}`)
  }

  const isReady = errors.length === 0

  // 1. For Approval / Submitted State
  if (statusLower === 'forapproval') {
    return (
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/40 shadow-xs">
        <CardHeader className="pb-3 border-b border-indigo-100/80">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <CardTitle className="text-base font-bold text-indigo-950">
                  Submitted — Pending Approval
                </CardTitle>
                <p className="text-xs text-indigo-700 mt-0.5">
                  This Purchase Order has been submitted and is awaiting review and approval by the Head of the Procuring Entity (HOPE).
                </p>
              </div>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold px-3 py-1 text-xs">
              Pending Approval
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Total Amount:</span>
              <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Items:</span>
              <span>{lineItems.length} line items to be supplied</span>
            </div>
          </div>
          {canForApproval && (
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenReturn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenReturn}
                  className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                >
                  <RotateCcw className="w-4 h-4" />
                  Return
                </Button>
              )}
              {onOpenApprove && (
                <Button
                  size="sm"
                  onClick={onOpenApprove}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Approve PO
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 2. Approved State (Finalized)
  if (statusLower === 'approved') {
    return (
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 shadow-xs">
        <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  Purchase Order Approved &amp; Finalized
                </h4>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-[10px] px-2 py-0.5">
                  Approved
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                This Purchase Order is approved. It is ready for official issuance and supplier fulfillment.
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs text-emerald-700 font-semibold block">Total Awarded</span>
            <span className="text-base font-bold text-emerald-950">{formatCurrency(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 3. Returned State
  if (statusLower === 'returned') {
    return (
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50/70 to-orange-50/40 shadow-xs">
        <CardHeader className="pb-3 border-b border-rose-100/80">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <CardTitle className="text-base font-bold text-rose-950">
                  Returned for Revision
                </CardTitle>
                <p className="text-xs text-rose-700 mt-0.5">
                  This Purchase Order was returned during review. Please address the remarks below and resubmit for approval.
                </p>
              </div>
            </div>
            <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-semibold px-3 py-1 text-xs">
              Returned
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {purchaseOrder.returnReason && (
            <div className="p-3 rounded-lg bg-white/80 border border-rose-200 text-xs text-rose-900">
              <span className="font-semibold block mb-1">Return Remarks from HOPE:</span>
              <p>{purchaseOrder.returnReason}</p>
            </div>
          )}

          {!isReady ? (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-rose-900 uppercase tracking-wider">
                Outstanding Issues ({errors.length})
              </h5>
              <ul className="space-y-1.5 pl-1">
                {errors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-rose-800">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All requirements are met. You can now resubmit this Purchase Order.
              </div>
              {onOpenSubmit && canSubmit && (
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={onOpenSubmit}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Resubmitting...' : 'Resubmit for Approval'}</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 4. Draft State: Ready for Submission
  if (isReady) {
    return (
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white shadow-xs">
        <CardHeader className="pb-3 border-b border-emerald-100/80">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base font-bold text-emerald-950">
                  Ready for Submission
                </CardTitle>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All required PO line items, supplier details, and delivery terms are complete.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold px-3 py-1 text-xs">
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-900">
              {passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
          {onOpenSubmit && canSubmit && (
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={onOpenSubmit}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex-shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // 5. Draft State: Incomplete
  return (
    <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/50 to-white shadow-xs">
      <CardHeader className="pb-3 border-b border-amber-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <CardTitle className="text-base font-bold text-amber-950">
                Not Ready for Submission
              </CardTitle>
              <p className="text-xs text-amber-800 mt-0.5">
                Complete the items below before submitting this Purchase Order for approval.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 font-semibold px-3 py-1 text-xs">
            Draft • Incomplete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            Required Actions ({errors.length})
          </h5>
          <ul className="space-y-1.5 pl-1">
            {errors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amber-800">
                <span className="text-amber-500 font-bold">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
