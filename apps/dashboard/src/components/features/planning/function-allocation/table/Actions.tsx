import { Lock, MoreHorizontal, Pencil, Trash2, UnlockIcon } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import DeleteFiscalYearDialog from '../dialog/DeleteFunctionAllocationDialog'
import LockFunctionAllocationDialog from '../dialog/LockFunctionAllocationDialog'
import UnlockFunctionAllocationDialog from '../dialog/UnlockFunctionAllocationDialog'
import UpdateFunctionAllocationDialog from '../dialog/UpdateFunctionAllocationDialog'
import type { MetaActions } from '@/types/global'
import type { FiscalYear } from '../../fiscal-year'
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
            <>
              {/* {data.isLocked ? <></> : <LockFunctionAllocationLink data={data} />} */}
              {data.isLocked ? (
                <UnlockFunctionAllocationLink data={data} />
              ) : (
                <LockFunctionAllocationLink data={data} />
              )}
            </>
          )}
          {actions?.includes('write') && !readonly && (
            <>
              {data.isLocked ? (
                <></>
              ) : (
                <UpdateFunctionAllocationLink year={data.id} />
              )}
            </>
          )}
          {actions?.includes('delete') && !readonly && (
            <> {
              data.isLocked ? (
                <></>
              ) : (
                <DeleteFunctionAllocationLink year={data.id} />
              )
            }
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const DeleteFunctionAllocationLink = ({ year }: { year: string }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/kpi',
      search: {
        ...search,
        delete: undefined,
      },
    })
  }
  const openDeleteDialog =
    Boolean(search.delete) && search.tab === 'function-allocation'
  return (
    <>
      <Link
        to="/planning/kpi"
        search={{ ...search, delete: true, tab: 'function-allocation' }}
      >
        <Button variant="ghost" size="sm">
          <Trash2 className="text-destructive" /> Delete
        </Button>
      </Link>
      {openDeleteDialog && (
        <DeleteFiscalYearDialog
          open={openDeleteDialog}
          ids={[year]}
          onOpenChange={(open) => open === false && handleClose()}
          onCancel={handleClose}
        />
      )}
    </>
  )
}

const LockFunctionAllocationLink = ({ data }: { data: FiscalYear }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })
  const handleClose = () => {
    navigate({
      to: '/planning/kpi',
      search: { ...search, lock: undefined },
    })
  }

  const openLockDialog =
    Boolean(search.lock) && search.tab === 'function-allocation'
  return (
    <>
      <Link
        to="/planning/kpi"
        search={{ ...search, lock: true, tab: 'function-allocation' }}
      >
        <Button variant="ghost" size="sm">
          <Lock className="text-green-600" /> Lock
        </Button>
      </Link>
      <LockFunctionAllocationDialog
        open={openLockDialog}
        ids={[data.id]}
        onOpenChange={(open) => open === false && handleClose()}
      />
    </>
  )
}

const UnlockFunctionAllocationLink = ({ data }: { data: FiscalYear }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/kpi',
      search: { ...search, unlock: undefined },
    })
  }

  const openUnlockDialog =
    Boolean(search.unlock) && search.tab === 'function-allocation'
  return (
    <>
      <Link
        to="/planning/kpi"
        search={{ ...search, unlock: true, tab: 'function-allocation' }}
      >
        <Button variant="ghost" size="sm">
          <UnlockIcon className="text-red-600" /> Unlock
        </Button>
      </Link>
      <UnlockFunctionAllocationDialog
        open={openUnlockDialog}
        ids={[data.id]}
        onOpenChange={(open) => open === false && handleClose()}
      />
    </>
  )
}

const UpdateFunctionAllocationLink = ({ year }: { year: string }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/kpi',
      search: { ...search, edit: undefined },
    })
  }

  const openEditDialog =
    Boolean(search.edit) && search.tab === 'function-allocation'
  return (
    <>
      <Link
        to="/planning/kpi"
        search={{ ...search, edit: true, tab: 'function-allocation' }}
      >
        <Button variant="ghost" size="sm">
          <Pencil /> Edit
        </Button>
      </Link>
      <UpdateFunctionAllocationDialog
        open={openEditDialog}
        onCancel={handleClose}
        onOpenChange={(open) => open === false && handleClose()}
        id={year}
      />
    </>
  )
}
