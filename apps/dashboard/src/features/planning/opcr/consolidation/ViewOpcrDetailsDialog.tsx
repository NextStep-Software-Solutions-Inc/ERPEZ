import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import type { OPCR } from '../types/type.opcr'

interface ViewOpcrDetailsDialogProps {
  opcr: OPCR | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOpcrDetailsDialog({
  opcr,
  open,
  onOpenChange,
}: ViewOpcrDetailsDialogProps) {
  if (!opcr) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="View OPCR"
      description="Complete details of the selected OPCR"
      footer={null}
      showCloseButton
    >
      <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            OPCR Name
          </label>
          <p className="text-base font-medium mt-1">{opcr.name}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Office
          </label>
          <p className="text-base font-medium mt-1">{opcr.officeName}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Fiscal Year
          </label>
          <p className="text-base font-medium mt-1">
            {typeof opcr.fiscalYear === 'number'
              ? opcr.fiscalYear
              : opcr.fiscalYear?.year}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Status
          </label>
          <div className="mt-1">
            <Badge
              variant={opcr.status === 'Approved' ? undefined : 'outline'}
              className={opcr.status === 'Approved' ? 'bg-green-500' : ''}
            >
              {opcr.status}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            KPI Count
          </label>
          <p className="text-base font-medium mt-1">
            {opcr.kpiAssignmentCount || 0}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Activity Count
          </label>
          <p className="text-base font-medium mt-1">
            {opcr.activityCount || 0}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Total Budget
          </label>
          <p className="text-base font-medium mt-1">
            ₱{(opcr.totalBudget || 0).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Created At
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(opcr.createdDate).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Last Updated
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            {opcr.updatedAt ? new Date(opcr.updatedAt).toLocaleString() : '—'}
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
