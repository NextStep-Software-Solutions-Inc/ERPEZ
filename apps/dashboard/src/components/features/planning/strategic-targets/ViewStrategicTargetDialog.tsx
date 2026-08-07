import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Target, Building, TrendingUp } from 'lucide-react'

interface StrategicTarget {
  id: number
  kpi: string
  dimension: string
  office: string
  fiscalYear: number
  q1Target: number
  q2Target: number
  q3Target: number
  q4Target: number
  isLocked: boolean
}

interface ViewStrategicTargetDialogProps {
  item: StrategicTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getDimensionClasses = (indicator: string) => {
  switch (indicator) {
    case 'Quality':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Efficiency':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Timeliness':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function ViewStrategicTargetDialog({ item, open, onOpenChange }: ViewStrategicTargetDialogProps) {
  if (!item) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="View Strategic Target"
      description="Complete details of the strategic target"
      footer={null}
      showCloseButton
    >
      <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* KPI */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Performance Indicator (KPI)
          </label>
          <p className="text-base font-medium mt-1">{item.kpi}</p>
        </div>

        {/* Dimension */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">Dimension</label>
          <div className="mt-1">
            <Badge variant="outline" className={`${getDimensionClasses(item.dimension)} w-fit`}>
              {item.dimension}
            </Badge>
          </div>
        </div>

        {/* Office and Fiscal Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Office
            </label>
            <p className="text-base font-medium mt-1">{item.office}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fiscal Year
            </label>
            <p className="text-base font-medium mt-1">{item.fiscalYear}</p>
          </div>
        </div>

        {/* Quarterly Targets */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quarterly Targets
          </label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <div className="text-sm font-medium text-sky-700">Q1 Target</div>
              <div className="text-lg font-bold text-sky-900">{item.q1Target}</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <div className="text-sm font-medium text-sky-700">Q2 Target</div>
              <div className="text-lg font-bold text-sky-900">{item.q2Target}</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <div className="text-sm font-medium text-sky-700">Q3 Target</div>
              <div className="text-lg font-bold text-sky-900">{item.q3Target}</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <div className="text-sm font-medium text-sky-700">Q4 Target</div>
              <div className="text-lg font-bold text-sky-900">{item.q4Target}</div>
            </div>
          </div>
        </div>

        {/* Lock Status */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">Status</label>
          <div className="mt-1">
            {item.isLocked ? (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                Locked
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Unlocked
              </Badge>
            )}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}