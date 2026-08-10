import { Check, Eye, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import {
  openActiveDialogAtom,
  openDeleteDialogAtom,
  openInactiveDialogAtom,
  openUpdateDialogAtom,
} from '../atoms'
import type { FundSource } from './types'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  data: FundSource
  readonly?: boolean
  actions?: MetaActions
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
          <Link to="/planning/fund/$fundId" params={{ fundId: data.id }}>
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          {actions?.includes('write') && !readonly && (
            <EditFundSourceLink fundSource={data} />
          )}
          {actions?.includes('write') && !readonly && (
            <ToggleStatusLink fundSource={data} />
          )}
          {actions?.includes('delete') && !readonly && (
            <DeleteFundSourceLink id={data.id} />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EditFundSourceLink = ({ fundSource }: { fundSource: FundSource }) => {
  const openUpdateDialog = useSetAtom(openUpdateDialogAtom)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => openUpdateDialog(fundSource)}
    >
      <Pencil className="mr-2 h-4 w-4" /> Edit
    </Button>
  )
}

const ToggleStatusLink = ({ fundSource }: { fundSource: FundSource }) => {
  const openActiveDialog = useSetAtom(openActiveDialogAtom)
  const openInactiveDialog = useSetAtom(openInactiveDialogAtom)
  const isActive = fundSource.isActive

  const handleToggleStatus = () => {
    if (isActive) {
      openInactiveDialog(fundSource)
    } else {
      openActiveDialog(fundSource)
    }
  }

  return (
    <>
      {isActive ? (
        <Button
          variant="ghost"
          size="sm"
          className=""
          onClick={handleToggleStatus}
        >
          <X className="mr-2 h-4 w-4 text-destructive" />
          Inactivate
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={handleToggleStatus}>
          <Check className="text-green-600 mr-2 h-4 w-4" />
          Activate
        </Button>
      )}
    </>
  )
}

const DeleteFundSourceLink = ({ id }: { id: string }) => {
  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)

  return (
    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(id)}>
      <Trash2 className="text-destructive mr-2 h-4 w-4" />
      Delete
    </Button>
  )
}
