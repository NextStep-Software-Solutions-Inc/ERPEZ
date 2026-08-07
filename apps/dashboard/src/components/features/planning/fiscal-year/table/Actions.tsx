import { Lock, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link, useSearch } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import type { FiscalYear } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
// import { Route } from '@/routes/planning/kpi' // Route not yet implemented

interface ActionsProps {
  data: FiscalYear
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
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
          {actions?.includes('write') && !readonly && (
            <LockFiscalYearLink data={data} />
          )}
          {actions?.includes('delete') && !readonly && (
            <DeleteFiscalYearLink year={data.id} />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const DeleteFiscalYearLink = ({ year }: { year: string }) => {
  const search = useSearch({
    from: Route.id,
  })
  return (
    <Link
      to="/planning/fiscal-year/$fiscalYearId/delete"
      params={{ fiscalYearId: year }}
      search={search}
    >
      <Button variant="ghost" size="sm">
        <Trash2 className="text-destructive" /> Delete
      </Button>
    </Link>
  )
}

const LockFiscalYearLink = ({ data }: { data: FiscalYear }) => {
  const search = useSearch({
    from: Route.id,
  })
  return (
    <Link
      to="/planning/fiscal-year/$fiscalYearId/lock"
      params={{ fiscalYearId: data.id }}
      search={search}
    >
      <Button variant="ghost" size="sm">
        <Lock className="text-orange-600" /> Lock
      </Button>
    </Link>
  )
}
