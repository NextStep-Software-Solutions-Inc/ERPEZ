import {
  Circle,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { getStatusBadgeColor, getStatusIcon, getSourceDisplay, type LIBStatus } from '../utils'

interface LibListProps {
  libs: LIB[]
  selectedIds: Set<string>
  onSelectOne: (id: string) => void
  onSelectAll: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onLinkCeiling?: (lib: LIB) => void
}

/**
 * Card-based LIB List Component
 * Displays LIBs in a modern card layout with search, filters, and pagination
 */
export const LibList = ({
  libs,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onLinkCeiling,
}: LibListProps) => {
  const handleToggleLibSelection = (libId: string) => {
    onSelectOne(libId)
  }

  if (libs.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="h-12 w-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 font-medium">No LIBs found</p>
        <p className="text-gray-400 text-sm mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with count and Select All */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {libs.length === 0
            ? 'No LIBs Found'
            : `${libs.length} LIB${libs.length !== 1 ? 's' : ''}`}
        </h3>
        {libs.length > 0 && (
          <button
            onClick={onSelectAll}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded transition-colors ${selectedIds.size === libs.length && libs.length > 0
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {selectedIds.size === libs.length && libs.length > 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Select All
              </>
            )}
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="space-y-3">
        {libs.map((lib) => (
          <div
            key={lib.id}
            className="group bg-white border border-gray-200 border-l-4 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
            style={{ borderLeftColor: `hsl(var(--primary))` }}
          >
            <div className="p-6">
              {/* Top Row - Checkbox, Title and Status */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => handleToggleLibSelection(lib.id)}
                    className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {selectedIds.has(lib.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <div className="flex flex-col">
                        <h4 className="text-xl font-bold text-gray-900">
                          {lib.name}{' '}
                        </h4>
                        <p className="  text-xs">{lib.libNumber}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {getSourceDisplay(lib)} • FY{' '}
                      {typeof lib.fiscalYear === 'string'
                        ? lib.fiscalYear
                        : lib.fiscalYear?.year || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(lib.status === 'PendingCeilingApproval') && onLinkCeiling && (
                    <Button
                      size="sm"
                      className="h-8 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold text-xs px-3 shadow-sm"
                      onClick={() => onLinkCeiling(lib)}
                    >
                      Link Ceiling
                    </Button>
                  )}
                  <Badge
                    className={`${getStatusBadgeColor(lib.status)} font-semibold px-4 py-1.5 gap-1.5 flex items-center`}
                  >
                    {(() => {
                      const IconComponent = getStatusIcon(lib.status as LIBStatus)
                      return <IconComponent className="h-4 w-4" />
                    })()}
                    {lib.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(lib.id)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onView(lib.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {lib.status === 'Submitted' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onApprove?.(lib.id)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onReject?.(lib.id)}
                            className="text-orange-600 focus:text-orange-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(lib.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Classification Section - 4 columns */}
              <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Scope / Level
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      scope: {lib.scope}
                    </span>
                    <span className="text-xs text-gray-600">
                      level: {lib.level}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fund Source
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {lib.fundSource?.name || 'N/A'}
                    </span>
                    {lib.fundSource?.code && (
                      <span className="text-xs text-gray-600">
                        ({lib.fundSource.code})
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Office
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {lib.office?.name || 'N/A'}
                    </span>
                    {lib.office?.code && (
                      <span className="text-xs text-gray-600">
                        {lib.office.code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Version
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    v{lib.version}
                  </p>
                </div>
              </div>

              {/* Metrics Section - 4 columns */}
              <div className="grid grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    ₱{(lib.totalAmount / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Activities
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {lib.activities?.length || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Source Type
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {lib.sourceType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Created
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {/* {new Date(lib.createdAt).toLocaleDateString()} */}
                    {lib.createdAt}
                  </p>
                </div>
              </div>

              {/* Remarks Section for Returned Status */}
              <div className="flex items-center justify-between gap-3">
                {lib.status === 'Returned' && (
                  <div className="flex-1 bg-red-50 border-l-4 border-l-red-500 rounded-r px-4 py-3">
                    <p className="text-red-700 font-medium text-sm">
                      Remarks required - Please review and resubmit
                    </p>
                  </div>
                )}
                {lib.status !== 'Returned' && <div className="flex-1" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
