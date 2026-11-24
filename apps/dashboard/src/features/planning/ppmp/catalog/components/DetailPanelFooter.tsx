/**
 * DetailPanelFooter
 * Quick-action buttons at the bottom of the item detail panel.
 * Actions: Activate/Deactivate toggle, Edit, Duplicate, Export, Delete
 */

import { useAtomValue, useSetAtom } from 'jotai'
import {
  Trash2,
  Copy,
  Download,
  ChevronDown,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { selectedItemDataAtom } from '../atoms/selectedItemAtom'
import {
  editItemDialogOpenAtom,
  itemToEditAtom,
  deleteItemDialogOpenAtom,
  itemToDeleteAtom,
} from '../atoms/catalogDialogAtoms'
import {
  useDuplicateCatalogItem,
} from '../hooks/useCatalogMutations'
import { toast } from 'sonner'

export function DetailPanelFooter() {
  const item = useAtomValue(selectedItemDataAtom)
  const setEditOpen = useSetAtom(editItemDialogOpenAtom)
  const setItemToEdit = useSetAtom(itemToEditAtom)
  const setDeleteOpen = useSetAtom(deleteItemDialogOpenAtom)
  const setItemToDelete = useSetAtom(itemToDeleteAtom)
  const duplicate = useDuplicateCatalogItem()

  if (!item) return null

  const handleEdit = () => {
    setItemToEdit(item)
    setEditOpen(true)
  }

  const handleDuplicate = () => {
    duplicate.mutate(item.id)
  }

  const handleDelete = () => {
    setItemToDelete(item)
    setDeleteOpen(true)
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    toast.info(`Export as ${format.toUpperCase()} coming soon.`)
  }

  return (
    <div className="border-t border-border pt-3 flex items-center gap-2 flex-wrap">
      <TooltipProvider delayDuration={300}>

        {/* Edit */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Edit item details
          </TooltipContent>
        </Tooltip>

        {/* Duplicate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={duplicate.isPending}
              onClick={handleDuplicate}
            >
              <Copy className="h-3.5 w-3.5" />
              {duplicate.isPending ? 'Copying…' : 'Duplicate'}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Create a copy of this item
          </TooltipContent>
        </Tooltip>

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem
              onClick={() => handleExport('csv')}
              className="text-xs"
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('excel')}
              className="text-xs"
            >
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('pdf')}
              className="text-xs"
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Permanently delete this item
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
