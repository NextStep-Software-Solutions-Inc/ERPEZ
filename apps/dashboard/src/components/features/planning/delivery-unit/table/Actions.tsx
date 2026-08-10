import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import DeleteDeliveryUnitDialog from '../dialog/DeleteDeliveryUnitDialog'
import type { MetaActions } from '@/types/global'
import type { DeliveryUnit } from './types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionsProps {
  data: DeliveryUnit
  readonly?: boolean
  actions?: MetaActions
  tableType?: 'main' | 'sub-delivery-units'
}

export function Actions({
  data,
  readonly,
  actions,
  tableType = 'main',
}: ActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2 justify-start items-start">
          {actions?.includes('read') && !readonly && (
            <Link
              to="/planning/office/$deliveryUnitId"
              params={{ deliveryUnitId: data.id }}
            >
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
            </Link>
          )}
          {actions?.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>

      <DeleteDeliveryUnitDialog
        ids={[data.id]}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        tableType={tableType}
      />
    </DropdownMenu>
  )
}
