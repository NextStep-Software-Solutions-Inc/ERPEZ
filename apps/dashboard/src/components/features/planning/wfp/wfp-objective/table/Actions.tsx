import { Eye, MoreHorizontal, Pencil, Tag, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { approveDialogAtom, updateDialogAtom, deleteDialogAtom } from '../atoms'
import type { WFPObjective } from './types'
import type { MetaActions } from '@/types/global'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionsProps {
  data: WFPObjective
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
  const navigate = useNavigate()
  const setUpdateDialog = useSetAtom(updateDialogAtom)
  const setApproveDialog = useSetAtom(approveDialogAtom)
  const setDeleteDialog = useSetAtom(deleteDialogAtom)

  const showApprove = actions?.includes('approve') && !readonly
  const showWrite = actions?.includes('write') && !readonly
  const showDelete = actions?.includes('delete') && !readonly

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
        {showApprove && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() => setApproveDialog({ isOpen: true, selectedId: data.id })}
          >
            <Tag className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Tag</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
          onClick={() =>
            navigate({
              to: `/v2/wfp-objective/$wfpObjectiveId`,
              params: { wfpObjectiveId: data.id },
            })
          }
        >
          <Eye className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">View</span>
        </DropdownMenuItem>
        {showWrite && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-muted/80 transition-colors"
            onClick={() =>
              setUpdateDialog({
                isOpen: true,
                selectedId: data.id,
                showUnsavedWarning: false,
              })
            }
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium">Edit</span>
          </DropdownMenuItem>
        )}

        {showDelete && <DropdownMenuSeparator className="mx-1 my-1" />}

        {showDelete && (
          <DropdownMenuItem
            className="gap-2 cursor-pointer h-9 px-2 hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors group"
            onClick={() =>
              setDeleteDialog({ isOpen: true, selectedIds: [data.id] })
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
