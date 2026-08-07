import { ChevronDown, Lock, Plus } from 'lucide-react'
import React from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PermissionCheck from '@/components/PermissionCheck'
// import { Route } from '@/routes/planning/kpi' // Route not yet implemented

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  fiscalYearSearch?: string
}
export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  fiscalYearSearch,
}: ToolbarProps<TData>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/fiscal-year/' })
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Update URL search params when search changes
  const updateFiscalYearSearch = (value: string) => {
    navigate({
      to: '/planning/fiscal-year',
      search: { ...search, fiscalYearSearch: value || undefined },
      replace: true,
    })
  }
  // Initialize table filter with fiscalYearSearch from URL
  React.useEffect(() => {
    table.getColumn('year')?.setFilterValue(fiscalYearSearch || '')
  }, [fiscalYearSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2 ">
        <Input
          placeholder="Search Function..."
          value={fiscalYearSearch || ''}
          onChange={(event) => updateFiscalYearSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant={'ghost'} onClick={() => updateFiscalYearSearch('')}>
          Clear
        </Button>
      </div>

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1"></div>
        <div className="flex items-center gap-2">
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions.includes('write') &&
            !readonly && (
              <>
                <PermissionCheck action="lock" actions={actions}>
                  <LockSelectedFiscalYearsButton table={table} />
                </PermissionCheck>
              </>
            )}
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions.includes('delete') &&
            !readonly && (
              <>
                <PermissionCheck action="delete" actions={actions}>
                  <DeleteSelectedFiscalYearsButton table={table} />
                </PermissionCheck>
              </>
            )}
          {!readonly && (
            <>
              <PermissionCheck action="write" actions={actions}>
                <CreateFiscalYearLink />
              </PermissionCheck>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const CreateFiscalYearLink = () => {
  const search = useSearch({
    from: Route.id,
  })

  return (
    <Link to="/planning/function-allocation/create" search={search}>
      <Button className="bg-(--button-blue)">
        <Plus />
        Create Function Allocation
      </Button>
    </Link>
  )
}

const LockSelectedFiscalYearsButton = ({ table }: { table: Table<any> }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/kpi/' })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id).join(',')

  const handleLockSelected = () => {
    navigate({
      to: '/planning/fiscal-year/$fiscalYearId/lock',
      params: { fiscalYearId: selectedIds },
      search: search,
    })
  }

  return (
    <Button
      variant="default"
      className="bg-orange-600 hover:bg-orange-700 text-white"
      onClick={handleLockSelected}
    >
      <Lock className="w-4 h-4 mr-2" />
      Lock Selected ({selectedRows.length})
    </Button>
  )
}

const DeleteSelectedFiscalYearsButton = ({ table }: { table: Table<any> }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/kpi/' })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows
    .map((row) => row.original.originalIds || [row.original.id])
    .flat()
    .join(',')

  const handleDeleteSelected = () => {
    navigate({
      to: '/planning/fiscal-year/$fiscalYearId/delete',
      params: { fiscalYearId: selectedIds },
      search: search,
    })
  }

  return (
    <Button
      variant="destructive"
      className="text-white"
      onClick={handleDeleteSelected}
    >
      Delete Selected{' '}
      {selectedRows.length
        ? `${selectedRows.length > 1 ? `${selectedRows.length} Rows` : `${selectedRows.length} Row`}`
        : ''}
    </Button>
  )
}
