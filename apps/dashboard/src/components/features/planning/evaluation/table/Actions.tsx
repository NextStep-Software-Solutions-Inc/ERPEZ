import { Eye, MoreHorizontal } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { Evaluation } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ActionsProps {
  data: Evaluation
  readonly?: boolean
}

export function Actions({}: ActionsProps) {
  const navigate = useNavigate()
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/planning/evaluation-detail-view' })}
          >
            <Eye /> View
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
