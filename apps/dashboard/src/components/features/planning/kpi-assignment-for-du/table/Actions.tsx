import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import DeleteDuKpiAssignmentDialog from '../dialog/DeleteDuKpiAssignmentDialog'
import type { MetaActions } from '@/types/global'
// import type { KpiAssignment } from './types'
import type { DeliveryUnit } from '../../delivery-unit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
// import { Route } from '@/routes/planning/kpi' // Route not yet implemented

interface ActionsProps {
  data: DeliveryUnit
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
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
          <Link
            to="/planning/kpi-assignment-for-du/$kpiAssignmentForDuId"
            params={{ kpiAssignmentForDuId: data.id }}
          >
            <Button variant="ghost" size="sm">
              <Eye /> View
            </Button>
          </Link>
          {actions?.includes('delete') && !readonly && (
            <DeleteDuKpiAssignmentLink id={data.id} />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const DeleteDuKpiAssignmentLink = ({ id }: { id: string }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/kpi',
      search: {
        ...search,
        delete: undefined,
      },
    })
  }

  const openDeleteDialog =
    Boolean(search.delete) && search.tab === 'kpi-assignment-for-du'

  return (
    <>
      <Link
        to="/planning/kpi"
        search={{ ...search, delete: true, tab: 'kpi-assignment-for-du' }}
      >
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Trash2 /> Delete
        </Button>
      </Link>
      <DeleteDuKpiAssignmentDialog
        open={openDeleteDialog}
        onOpenChange={handleClose}
        ids={[id]}
      />
    </>
  )
}
