'use client'

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useSetAtom } from 'jotai'
import {
  updateOfficeDialogAtom,
  deleteOfficeDialogAtom,
} from '../atoms'
import type { OrgUnit } from './types'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

interface OrgUnitActionsProps {
  data: OrgUnit
  readonly?: boolean
  actions: MetaActions
}

export default function OrgUnitActions({
  data,
  readonly = false,
  actions = [],
}: OrgUnitActionsProps) {
  if (readonly) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2">
          <PermissionCheck action="write" actions={actions}>
            <EditLink data={data} />
          </PermissionCheck>
          <PermissionCheck action="delete" actions={actions}>
            <DeleteLink id={data.id} />
          </PermissionCheck>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EditLink = ({ data }: { data: OrgUnit }) => {
  const openUpdateOfficeDialog = useSetAtom(updateOfficeDialogAtom)

  const handleClick = () => {
    openUpdateOfficeDialog({
      isOpen: true,
      showUnsavedWarning: false,
      selectedId: data.id,
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="w-full justify-start">
      <Pencil className="mr-2 h-4 w-4" /> Edit
    </Button>
  )
}

const DeleteLink = ({ id }: { id: string }) => {
  const openDeleteOfficeDialog = useSetAtom(deleteOfficeDialogAtom)

  const handleClick = () => {
    openDeleteOfficeDialog({
      isOpen: true,
      selectedId: id,
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  )
}
