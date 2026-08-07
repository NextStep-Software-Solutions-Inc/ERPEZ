import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PPMPDetails, PPMPState } from '../../types'
import { selectedPpmpForEditAtom } from '../../atoms'
import { getPPMPRequest } from '../../handlers'
import { FolderOpen, Loader2, MoreVertical, Trash2 } from 'lucide-react'

const usePpmpDetail = createQueryHookFromTemplate(getPPMPRequest)

interface PpmpActionsProps {
  row: PPMPDetails
  onOpen?: (item: PPMPDetails) => void
  onDelete?: (item: PPMPDetails) => void
}

export function PpmpActions({ row, onOpen, onDelete }: PpmpActionsProps) {
  const [isOpening, setIsOpening] = useState(false)
  const setPpmpForEdit = useSetAtom(selectedPpmpForEditAtom)

  const { refetch } = usePpmpDetail({
    pathParams: { id: row.id },
    queryParams: {},
    enabled: false,
  })

  const handleOpen = async () => {
    setIsOpening(true)
    try {
      const { data } = await refetch()
      // Store fetched PPMP in atom so workspace page doesn't need to refetch
      if (data?.data) {
        setPpmpForEdit(data.data)
      }
      onOpen?.(row)
    } finally {
      setIsOpening(false)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Open row actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleOpen}
          disabled={isOpening}
          className="cursor-pointer"
        >
          {isOpening ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="mr-2 h-4 w-4" />
          )}
          {isOpening ? 'Opening...' : 'Open'}
        </DropdownMenuItem>
        {(row.state === PPMPState.DRAFT ||
          row.state === PPMPState.REJECTED) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(row)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
