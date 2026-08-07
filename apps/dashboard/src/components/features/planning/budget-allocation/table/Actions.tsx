import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import type { MetaActions } from '@/types/global'
import type { DUAllocation } from './types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  deleteDialogAtom,
} from '@/components/features/planning/budget-allocation/atoms'

interface ActionsProps<TData extends DUAllocation = DUAllocation> {
  data: TData
  readonly?: boolean
  page?: 'delivery-unit' | 'allocation'
  actions?: MetaActions
}

export function Actions<TData extends DUAllocation = DUAllocation>({
  data,
  readonly = false,
  actions = [],
  page,
}: ActionsProps<TData>) {
  // const openUpdateDialog = useSetAtom(updateDialogAtom)
  const openDeleteDialog = useSetAtom(deleteDialogAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2 items-start">
          {/* View */}
          <Link
            to="/planning/fund/$budgetAllocationId"
            params={{ budgetAllocationId: data.id }}
            search={{ page: page === 'delivery-unit' ? 'delivery-unit' : 'allocations' }}
          >
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          
          {/* Delete */}
          {actions.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() =>
                openDeleteDialog({
                  isOpen: true,
                  selectedId: data.id,
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
