import { Edit, Eye, MoreHorizontal, Send, Trash2 } from 'lucide-react'
import { Link, useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import type { MetaActions } from '@/types/global'
import type { OPCR } from '../types'
import {
  openDeleteDialogAtom,
  openSubmitDialogAtom,
  openUpdateDialogAtom,
} from '@/features/planning/opcr/atoms/dialogAtoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  data: OPCR
  readonly?: boolean
  actions?: MetaActions
  role?: string
}

export function Actions({ data, readonly, actions, role }: ActionsProps) {
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)
  const openUpdateDialog = useSetAtom(openUpdateDialogAtom)
  const openSubmitDialog = useSetAtom(openSubmitDialogAtom)
  const { deliveryUnitId } = role !== 'super_admin' ? useParams({ from: '/planning/$deliveryUnitId/opcr/' }) : { deliveryUnitId: undefined }

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
            <Link
              to={role === 'super_admin' ? '/planning/opcr/$opcrId' : '/planning/$deliveryUnitId/opcr/$opcrId'}
              params={role === 'super_admin' ? { opcrId: data.id } : { deliveryUnitId, opcrId: data.id }}
            >
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
            </Link>
          )}
          {actions?.includes('write') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openUpdateDialog(data)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {actions?.includes('write') && !readonly && data.status !== 'Submitted' && data.activityCount !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openSubmitDialog(data.id)}
            >
              <Send className="mr-2 h-4 w-4" /> Submit OPCR
            </Button>
          )}
          {actions?.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteDialog(data)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
