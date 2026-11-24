import { Check, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import type { WFP } from './types'
import type { MetaActions } from '@/types/global'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { submitWfpDialogAtom } from '../dialog/SubmitWfpDialog'
import { updateDialogAtom, deleteDialogAtom, approveDialogAtom } from '../atoms'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/constants/permissions'

interface ActionsProps {
  data: WFP
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [, setUpdateDialogState] = useAtom(updateDialogAtom)
  const [, setSubmitDialogState] = useAtom(submitWfpDialogAtom)
  const [, setDeleteDialogState] = useAtom(deleteDialogAtom)
  const [, setApprovedDialogState] = useAtom(approveDialogAtom)

  const canUpdate = hasPermission(PERMISSIONS.Planning.Wfp.Update)
  const canSubmit = hasPermission(PERMISSIONS.Planning.Wfp.Submit)
  const canApprove = hasPermission(PERMISSIONS.Planning.Wfp.Approve)
  const canDelete = hasPermission(PERMISSIONS.Planning.Wfp.Delete)

  const showWrite = canUpdate && data.status === 'Draft' && !readonly
  const showRead = !readonly
  const showSubmit = canSubmit && data.status === 'Draft' && !readonly
  const showApprove = canApprove && data.status === 'Submitted' && !readonly
  const showDelete = canDelete && data.status === 'Draft' && !readonly

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted/80 rounded-full"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] p-1.5 space-y-1">
        {showRead && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() =>
              navigate({
                to: `/v2/wfp/$wfpId`,
                params: { wfpId: data.id },
              })
            }
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">View Details</span>
          </DropdownMenuItem>
        )}
        {showWrite && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() =>
              setUpdateDialogState({ isOpen: true, selectedId: data.id })
            }
          >
            <Edit className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Edit</span>
          </DropdownMenuItem>
        )}
        {showSubmit && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() =>
              setSubmitDialogState({ isOpen: true, wfpId: data.id })
            }
          >
            <Check className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Submit</span>
          </DropdownMenuItem>
        )}
        {showApprove && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() =>
              setApprovedDialogState({ isOpen: true, selectedId: data.id })
            }
          >
            <Check className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Approve</span>
          </DropdownMenuItem>
        )}

        {(showRead || showWrite || showSubmit || showApprove) && showDelete && (
          <DropdownMenuSeparator className="mx-1 my-1" />
        )}

        {showDelete && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors group"
            onClick={() =>
              setDeleteDialogState({ isOpen: true, selectedId: data.id })
            }
          >
            <Trash2 className="h-4 w-4 text-destructive/80 group-hover:text-destructive" />
            <span className="text-sm font-medium">Delete</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
