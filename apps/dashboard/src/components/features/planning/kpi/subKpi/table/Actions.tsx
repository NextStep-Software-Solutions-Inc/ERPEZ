import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import {
  openDeleteDialogAtom,
} from '../atoms'
import type { MetaActions } from '@/types/global'
import type { KPI } from '../../types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionsProps {
  data: KPI
  readonly?: boolean
  actions?: MetaActions
  isDuView?: boolean
  duKpi?: boolean
}

export function Actions({ data, readonly, actions }: ActionsProps) {
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)

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
          <Link to="/planning/kpi/$kpiId/subKpi/$subKpiId" params={{ kpiId: data.parentKPIId || "", subKpiId: data.id }}>
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </Link>
          {actions?.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => openDeleteDialog([data.id])}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
