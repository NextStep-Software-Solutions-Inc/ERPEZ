/**
 * KPI Activation Table Actions
 * Step 2: Configure activated KPIs
 */

import { MoreHorizontal, Trash2, Edit } from 'lucide-react'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ readonly, actions }: ActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2 justify-start items-start">
          {actions?.includes('write') && !readonly && (
            <EditKPIAction />
          )}
          {actions?.includes('delete') && !readonly && (
            <DeleteKPIAction />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EditKPIAction = () => {
  return (
    <Button type="button" variant="ghost" size="sm" className="w-full justify-start">
      <Edit className="h-4 w-4 mr-2" /> Edit
    </Button>
  )
}

const DeleteKPIAction = () => {
  return (
    <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
      <Trash2 className="h-4 w-4 mr-2" /> Delete
    </Button>
  )
}
