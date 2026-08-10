import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu' 
import type { MouseEvent } from 'react'
interface ApprovalWorkflowActionsProps {
  workflow: {
    id: string
    status: string
  }
  onView?: (workflow: any) => void
  onGenerate?: (workflowId: string) => void
}

export function ApprovalWorkflowActions({
  workflow,
  onView,
  onGenerate,
}: ApprovalWorkflowActionsProps) {
  const handleView = (e: MouseEvent) => {
    e.stopPropagation()
    onView?.(workflow)
  }

  const handleGenerate = (e: MouseEvent) => {
    e.stopPropagation()
    onGenerate?.(workflow.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGenerate}>
          <Download className="h-4 w-4 mr-2" />
          Generate OPCR
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleView}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}