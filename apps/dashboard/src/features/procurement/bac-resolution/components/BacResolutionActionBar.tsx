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
  isLoading?: boolean
}

export function BacResolutionActionBar({
  role,
  resolution,
  onCreate,
  onManageClauses,
  onApprove,
  onReturn,
  isLoading = false,
}: BacResolutionActionBarProps) {
  const isForApproval = resolution?.status === 'for-approval'

  return (
    <div className="flex flex-wrap gap-3 justify-end">
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
