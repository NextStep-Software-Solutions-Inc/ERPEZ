import { Eye, MoreHorizontal } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { FundSource } from './types'
import type { MetaActions } from '@/types/global'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'

interface ActionsProps {
  data: FundSource
  readonly?: boolean
  actions: MetaActions
}

export default function Actions({ data, actions }: ActionsProps) {
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
          <PermissionCheck action="read" actions={actions}>
            <Link
              to="/planning/fund-receive/$fundSourceId"
              params={{ fundSourceId: data.id }}
            >
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </Link>
          </PermissionCheck>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
