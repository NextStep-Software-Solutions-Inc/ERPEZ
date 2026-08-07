import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Edit, MoreVertical, Lock, LockOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { MasterKPI as ProductionMasterKPI } from '@/features/planning/master-kpi/types'
import type { MasterKPI as MockMasterKPI } from '../../shared/utils/mockMasterKPIs'

// Union type for both production and mock KPI data
type KPIData = ProductionMasterKPI | MockMasterKPI

interface UseActivateKpisColumnsProps {
  onViewDetails: (kpi: KPIData) => void
  onRemoveClick: (kpiId: string, kpiName: string) => void
  onEditClick: (kpi: KPIData) => void
  isLocked?: boolean
}

/**
 * Type guard to check if KPI is mock data with extended properties
 */
function isMockKPI(kpi: KPIData): kpi is MockMasterKPI {
  return 'status' in kpi && 'defaultAggregation' in kpi
}

/**
 * Hook to generate KPI columns for the Active KPIs table
 * Includes all data columns and actions dropdown
 * Supports both production and mock KPI data types
 */
export const useActivateKpisColumns = ({
  onViewDetails,
  onRemoveClick,
  onEditClick,
  isLocked: isTableLocked = false,
}: UseActivateKpisColumnsProps): ColumnDef<KPIData>[] => [
  {
    accessorKey: 'code',
    header: 'Code',
    size: 80,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    size: 250,
  },
  {
    accessorKey: 'functionType',
    header: 'Function',
    size: 140,
    cell: ({ row }) => {
      const kpi = row.original
      const functionType = (kpi as any).functionType || 'CoreFunction'
      const labelMap: Record<string, string> = {
        'CoreFunction': 'Core Function',
        'StrategicPriority': 'Strategic Priority',
        'MandatorySupport': 'Mandatory Support',
      }
      return labelMap[functionType] || functionType
    },
  },
  {
    accessorKey: 'aggregationMethod',
    header: 'Behaviour',
    size: 100,
    cell: ({ row }) => {
      const kpi = row.original
      const method = isMockKPI(kpi) ? kpi.defaultAggregation : ((kpi as any).aggregationMethod || 'SUM')
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {method}
        </span>
      )
    },
  },
  {
    accessorKey: 'measurementUnit',
    header: 'Unit',
    size: 100,
    cell: ({ row }) => {
      const kpi = row.original
      return (kpi as any).measurementUnit || (kpi as any).unitOfMeasure || 'Number'
    },
  },
  {
    accessorKey: 'ownerOffice',
    header: 'Owner Office',
    size: 140,
    cell: ({ row }) => {
      const kpi = row.original
      return (kpi as any).mfopap?.name || (kpi as any).ownerOffice || 'Research Program'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: ({ row }) => {
      const kpi = row.original
      const status = isMockKPI(kpi) ? kpi.status : ((kpi as any).status || 'Draft')
      const isLocked = isTableLocked || (kpi as any).isLocked || (status as string).toLowerCase() === 'assigned' || (status as string).toLowerCase() === 'established'
      
      const statusColors: Record<string, { bg: string; text: string }> = {
        'Draft': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
        'Active': { bg: 'bg-green-50', text: 'text-green-700' },
        'TargetsSet': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Assigned': { bg: 'bg-purple-50', text: 'text-purple-700' },
        'Established': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'Inactive': { bg: 'bg-gray-50', text: 'text-gray-700' },
        'Pending': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'Archived': { bg: 'bg-red-50', text: 'text-red-700' },
      }
      const colors = statusColors[status as string] || { bg: 'bg-gray-50', text: 'text-gray-700' }
      
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isLocked ? (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <LockOpen className="w-4 h-4 flex-shrink-0" />
                )}
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {isLocked ? 'KPIs are locked - cannot be modified' : 'KPIs are unlocked and can be modified'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>{status || '-'}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 80,
    cell: ({ row }) => {
      const kpi = row.original as any
      const statusLower = (kpi.status || '').toLowerCase()
      const isItemLocked = isTableLocked || kpi.isLocked || statusLower === 'assigned' || statusLower === 'established'

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => onViewDetails(kpi)}
            >
              View Details
            </DropdownMenuItem>
            {!isItemLocked && (
              <>
                <DropdownMenuItem
                  onSelect={() => onEditClick(kpi)}
                  className="text-blue-600 cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onRemoveClick(kpi.id || '', kpi.name || kpi.code || '')}
                  className="text-red-600 cursor-pointer"
                >
                  Remove KPI
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
