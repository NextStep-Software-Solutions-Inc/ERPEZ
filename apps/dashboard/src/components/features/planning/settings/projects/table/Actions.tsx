import { Eye, MoreHorizontal, TagIcon, Trash2 } from 'lucide-react'
import React from 'react'
import DeleteProjectDialog from '../dialog/DeleteProjectDialog'
import type { Project } from '../table/types'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  data: Project
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
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
          {actions?.includes('approve') && !readonly && (
            <Button
              variant={'ghost'}
              size="sm"
              onClick={() => {
                alert(`Tagging as approved project ${data.projectName}`)
              }}
            >
              <TagIcon /> Tag
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Eye /> View
          </Button>
          {actions?.includes('delete') && !readonly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="text-destructive" /> Delete
            </Button>
          )}
          <DeleteProjectDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            ids={[data.id]}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
