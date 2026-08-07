import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { openDeleteDialogAtom, openUpdateDialogAtom } from '../atoms'
import type { FundReceiving } from './types'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

interface ActionsProps {
  data: FundReceiving
  readonly?: boolean
  actions: MetaActions
}

export default function Actions({ data, readonly, actions }: ActionsProps) {
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
          <PermissionCheck action="write" actions={actions}>
            <EditFundReceivingLink fundReceiving={data} />
          </PermissionCheck>
          <PermissionCheck action="delete" actions={actions}>
            <DeleteFundReceivingLink id={data.id} />
          </PermissionCheck>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
const EditFundReceivingLink = ({
  fundReceiving,
}: {
  fundReceiving: FundReceiving
}) => {
  const openUpdateDialog = useSetAtom(openUpdateDialogAtom)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => openUpdateDialog(fundReceiving)}
    >
      <Pencil className="mr-2 h-4 w-4" /> Edit
    </Button>
  )
}
const DeleteFundReceivingLink = ({ id }: { id: string }) => {
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)

  return (
    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(id)}>
      <Trash2 className="text-destructive mr-2 h-4 w-4" />
      Delete
    </Button>
  )
}
