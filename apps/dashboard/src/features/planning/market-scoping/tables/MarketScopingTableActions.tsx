/**
 * Market Scoping Table Actions
 * Dropdown row actions with custom action filtering based on status
 * Location: src/features/planning/market-scoping/tables/
 */

import { Download, Edit2, Eye, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import { getAvailableActions, MARKET_SCOPING_ACTIONS } from '../utils/customActions'

interface MarketScopingTableActionsProps {
  form: MarketScopingForm
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
  onDownloadPdf?: (pdfUrl: string) => void
}

// Icon map for rendering action icons
const ICON_MAP = {
  Eye,
  Edit2,
  Trash2,
  Download,
}

export function MarketScopingTableActions({
  form,
  onViewDetails,
  onEdit,
  onDelete,
  onDownloadPdf,
}: MarketScopingTableActionsProps) {
  // Get available actions for this form based on status
  const availableActions = getAvailableActions(form)
  const hasActions = availableActions.length > 0

  if (!hasActions) {
    return null
  }

  // Action handlers map
  const actionHandlers = {
    view: onViewDetails,
    edit: onEdit,
    delete: onDelete,
    'download-pdf': () => {
      if (form.pdfUrl) {
        onDownloadPdf?.(form.pdfUrl) ?? window.open(form.pdfUrl, '_blank')
      }
    },
  }

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Open row actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {availableActions.map((actionId, index) => {
            const action = MARKET_SCOPING_ACTIONS[actionId]
            const IconComponent = ICON_MAP[action.icon as keyof typeof ICON_MAP]
            const isDisabled = action.isDisabled?.(form) ?? false

            return (
              <div key={actionId}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={actionHandlers[actionId] as () => void}
                  disabled={isDisabled}
                  className={`cursor-pointer ${
                    action.isDestructive ? 'text-destructive focus:text-destructive' : ''
                  }`}
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
