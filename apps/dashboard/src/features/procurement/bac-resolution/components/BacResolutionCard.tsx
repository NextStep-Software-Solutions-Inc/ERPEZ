import { KeyboardEvent } from 'react'
import { MoreVertical, Edit, Trash, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BacResolutionExecutionBadges } from './BacResolutionExecutionBadges'
import {
  getPrimaryLinkedConsolidatedPr,
} from '../utils/bacResolutionWorkflow'
import { BacResolutionStatusBadge } from './index'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  BacResolution,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import { cn } from '@/lib/utils'

interface BacResolutionCardProps {
  resolution: BacResolution
  isActive: boolean
  onSelect: () => void
  role: BacResolutionRole
  workspaceScope: BacResolutionWorkspaceScope
  bacListRoutePath: BacResolutionListRoutePath
  onEdit?: (resolution: BacResolution) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
}

export function BacResolutionCard({
  resolution,
  isActive,
  onSelect,
  role: _role,
  workspaceScope: _workspaceScope,
  bacListRoutePath: _bacListRoutePath,
  onEdit,
  onDelete,
  onViewDetails,
}: BacResolutionCardProps) {
  const DESCRIPTION_TOOLTIP_THRESHOLD = 120
  const hasLongDescription =
    (resolution.description || '').length > DESCRIPTION_TOOLTIP_THRESHOLD
  const tooltipId = `${resolution.id}-desc-tooltip`
  const primaryLinkedPr = getPrimaryLinkedConsolidatedPr(resolution)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-describedby={hasLongDescription ? tooltipId : undefined}
      aria-pressed={isActive}
      aria-selected={isActive}
      className={cn(
        'relative group flex w-96 flex-col justify-between h-auto min-h-28 p-5 text-left rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 cursor-pointer',
        isActive
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm',
      )}
    >
      {/* Top Section: Title, Badge, and Description */}
      <div className="w-full space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="font-semibold text-foreground truncate"
              title={resolution.bacResolutionNumber}
            >
              {resolution.bacResolutionNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BacResolutionStatusBadge status={resolution.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onViewDetails) {
                      onViewDetails(resolution.id)
                    }
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {resolution.status === 'draft' && onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(resolution)
                    }}
                    className="cursor-pointer gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Draft
                  </DropdownMenuItem>
                )}
                {resolution.status === 'draft' && onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(resolution.id)
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive gap-2"
                  >
                    <Trash className="h-4 w-4" />
                    Delete Draft
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative">
          <p
            className="text-sm leading-snug text-muted-foreground line-clamp-2 text-balance"
            title={!hasLongDescription ? resolution.description : undefined}
          >
            {resolution.description}
          </p>

          <div className="mt-2">
            <BacResolutionExecutionBadges
              resolution={resolution}
              helperTextClassName="text-[11px] text-muted-foreground"
            />
          </div>

          {hasLongDescription && (
            <div
              id={tooltipId}
              role="tooltip"
              className="pointer-events-none absolute left-0 bottom-full mb-2 w-[20rem] max-w-[40vw] rounded-md bg-foreground/95 p-3 text-xs text-background opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <div className="max-h-40 overflow-auto leading-snug">
                {resolution.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Meta Data */}
      <div className="flex w-full items-center justify-between mt-5 text-xs text-muted-foreground">
        <span aria-hidden="true" className="font-medium">
          {primaryLinkedPr?.prNumber ?? 'No linked PR'}
        </span>
        <span aria-hidden="true" className="font-semibold text-foreground">
          ₱{(resolution.totalAmount ?? 0).toLocaleString('en-PH')}
        </span>
      </div>

      {/* {(canScheduleNavigate || showScheduleBlocker) && (
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            size="sm"
            variant={scheduleEntryState.canOpenSchedule ? 'outline' : 'default'}
            className="w-full gap-2"
            disabled={!canScheduleNavigate}
            onClick={(event) => {
              event.stopPropagation()

              if (!canScheduleNavigate) {
                return
              }

              void navigate({
                to: scheduleRoutePath,
                params: { resolutionId: resolution.id },
              })
            }}
          >
            <CalendarDays className="h-4 w-4" />
            {scheduleCtaLabel}
          </Button>

          {showScheduleBlocker ? (
            <p className="text-xs text-warning">
              Link exactly one Consolidated PR to enable scheduling.
            </p>
          ) : null}
        </div>
      )} */}

      {/* Screen Reader Data */}
      <div className="sr-only">
        <span>Status: {resolution.status}</span>
        <span>Linked PRs: {resolution.linkedConsolidatedPrs.length}</span>
        <span>
          Total amount: ₱{(resolution.totalAmount ?? 0).toLocaleString('en-PH')}
        </span>
      </div>
    </div>
  )
}

export default BacResolutionCard
