import { Button } from '@/components/ui/button'
import { BookOpen, PlusCircle, RotateCcw, ShieldCheck } from 'lucide-react'
import type { BacResolution, BacResolutionRole } from '../types'

interface BacResolutionActionBarProps {
  role: BacResolutionRole
  resolution?: BacResolution
  onCreate?: () => void
  onManageClauses?: () => void
  onApprove?: () => void
  onReturn?: () => void
  onViewDocument?: () => void
  onCreatePr?: () => void
  isLoading?: boolean
}

export function BacResolutionActionBar({
  role,
  resolution,
  onCreate,
  onManageClauses,
  onApprove,
  onReturn,
  onViewDocument,
  onCreatePr,
  isLoading = false,
}: BacResolutionActionBarProps) {
  const isForApproval = resolution?.status === 'for-approval'
  const isApproved = resolution?.status === 'approved'
  const isAppDriven = resolution?.sourceType === 'APP_ITEM' || !resolution?.linkedConsolidatedPrs.length
  const isPrCreated = resolution?.isPrCreated

  const getExecutionTarget = () => {
    const mode = (resolution?.procurementProjectContext?.modeOfProcurement || resolution?.linkedConsolidatedPrs[0]?.modeOfProcurement || '').toLowerCase()
    if (mode.includes('direct')) {
      return { label: 'Proceed to Direct Contracting', path: '/v2/direct-contracting-request' }
    }
    if (mode.includes('shopping') || mode.includes('small value') || mode.includes('svp') || mode.includes('negotiated')) {
      return { label: 'Proceed to RFQ / SVP', path: '/v2/rfq' }
    }
    return { label: 'Proceed to Bidding Calendar', path: '/v2/bidding-master-calendar' }
  }

  const executionTarget = getExecutionTarget()

  return (
    <div className="flex flex-wrap gap-3 justify-end">
      {onViewDocument && resolution && (
        <Button
          variant="outline"
          onClick={onViewDocument}
          disabled={isLoading}
          className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <BookOpen className="h-4 w-4" />
          View Document Preview
        </Button>
      )}

      {isApproved && isPrCreated && (
        <Button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = executionTarget.path
            }
          }}
          disabled={isLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          {executionTarget.label}
        </Button>
      )}

      {isApproved && isAppDriven && !isPrCreated && onCreatePr && (
        <Button
          onClick={onCreatePr}
          disabled={isLoading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Create Purchase Request (PR)
        </Button>
      )}

      {role === 'procurement-staff' && onManageClauses && (
        <Button
          variant="outline"
          onClick={onManageClauses}
          disabled={isLoading}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Manage WHEREAS Clauses
        </Button>
      )}

      {role === 'procurement-staff' && onCreate && (
        <Button onClick={onCreate} disabled={isLoading} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create BAC Resolution
        </Button>
      )}

      {role === 'bac-chairperson' && isForApproval && onApprove && (
        <Button onClick={onApprove} disabled={isLoading} className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          Approve
        </Button>
      )}

      {role === 'bac-chairperson' && isForApproval && onReturn && (
        <Button
          variant="outline"
          onClick={onReturn}
          disabled={isLoading}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Return
        </Button>
      )}
    </div>
  )
}
