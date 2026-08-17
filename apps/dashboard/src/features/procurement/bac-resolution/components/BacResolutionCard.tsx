import { KeyboardEvent } from 'react'
import { MoreVertical, Edit, Trash, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const context = resolution.procurementProjectContext
  const title = context?.projectTitle || resolution.description || 'Procurement Project'
  const totalAmount = context?.abc || resolution.totalAmount || 0

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
      aria-pressed={isActive}
      aria-selected={isActive}
      className={cn(
        'group relative w-full rounded-xl border p-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer space-y-2',
        isActive
          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40'
          : 'border-default-200 bg-white hover:border-primary/40 hover:bg-default-50/70',
      )}
    >
      {/* Active Indicator Bar on Left */}
      {isActive && (
        <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-primary rounded-r" />
      )}

      {/* Top Row: Resolution # + Status Badge + Actions Menu */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-xs text-primary truncate">
          {resolution.bacResolutionNumber}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <BacResolutionStatusBadge status={resolution.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
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
                View Full Details
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

      {/* Middle: Project Title */}
      <p
        className="font-medium text-xs text-foreground line-clamp-2 leading-snug"
        title={title}
      >
        {title}
      </p>

      {/* Bottom Row: Minimal Source Tag + Amount */}
      <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
        {resolution.sourceType === 'APP_ITEM' ? (
          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700 text-[10px] border border-blue-200/60">
            APP Item
          </span>
        ) : (
          <span className="rounded-md bg-purple-50 px-1.5 py-0.5 font-medium text-purple-700 text-[10px] border border-purple-200/60">
            Consolidated PR
          </span>
        )}

        <span className="font-bold text-emerald-700 text-xs">
          ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}

export default BacResolutionCard
