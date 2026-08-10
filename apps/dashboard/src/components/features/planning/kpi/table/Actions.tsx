import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { openDeleteDialogAtom } from '../atoms/dialogAtoms'
import type { MetaActions } from '@/types/global'
import type { KPI } from '../types'
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
  role?: string
  deliveryUnitId?: string
}

export function Actions({ data, readonly, actions, role, deliveryUnitId }: ActionsProps) {
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)
  const { deliveryUnitId: routeDeliveryUnitId } = role !== 'super_admin' ? useParams({ from: '/planning/$deliveryUnitId/opcr/' }) : { deliveryUnitId: undefined }

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
          {actions?.includes('read') && (
            <ViewButton role={role} data={data} deliveryUnitId={deliveryUnitId || routeDeliveryUnitId} />
          )}
          {actions?.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteDialog([data])}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ViewButton = ({ role, data, deliveryUnitId }: { role?: string; data: KPI; deliveryUnitId?: string }) => {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        navigate({
          to: role === 'super_admin'
            ? `/planning/kpi/${data.id}`
            : '/planning/$deliveryUnitId/opcr/kpi/$kpiId',
          params: role === 'super_admin'
            ? undefined
            : { deliveryUnitId, kpiId: data.id }
        })
      }
    >
      <Eye className="mr-2 h-4 w-4" /> View
    </Button>
  )
}