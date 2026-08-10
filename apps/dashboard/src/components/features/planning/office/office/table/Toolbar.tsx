import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import CreateOfficeDialog from '../dialog/CreateOfficeDialog'
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
import { Route } from '@/routes/v1/planning/office'

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  officeSearch?: string
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  officeSearch,
}: ToolbarProps<TData>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/office/' })
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Force re-render when column visibility changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  // Get selected rows count from table state to ensure reactivity
  const selectedRowsCount = Object.keys(table.getState().rowSelection).length

  // Update URL search params when search changes
  const updateOfficeSearch = (value: string) => {
    navigate({
      to: '/planning/office',
      search: { ...search, officeNameSearch: value || undefined },
      replace: true,
    })
  }

  // Initialize table filter with officeSearch from URL
  React.useEffect(() => {
    table.getColumn('name')?.setFilterValue(officeSearch || '')
  }, [officeSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search Office..."
          value={officeSearch || ''}
          onChange={(event) => updateOfficeSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant={'ghost'} onClick={() => updateOfficeSearch('')}>
          Clear
        </Button>
      </div>

      <div className="grow flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
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
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value)
                        forceUpdate()
                      }}
                      onSelect={(event) => event.preventDefault()}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRowsCount > 0 && actions.includes('delete') && !readonly && (
            <PermissionCheck action="delete" actions={actions}>
              <Button
                variant="destructive"
                className="text-white"
                onClick={() => {
                  alert(
                    `Delete ${table.getFilteredSelectedRowModel().rows.length} selected rows`,
                  )
                }}
              >
                Delete Selected{' '}
                {table.getFilteredSelectedRowModel().rows.length
                  ? `${table.getFilteredSelectedRowModel().rows.length > 1 ? `${table.getFilteredSelectedRowModel().rows.length} Rows` : `${table.getFilteredSelectedRowModel().rows.length} Row`}`
                  : ''}
              </Button>
            </PermissionCheck>
          )}

          {!readonly && (
            <PermissionCheck action="write" actions={actions}>
              <CreateOfficeLink />
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}

const CreateOfficeLink = () => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleCancel = () => {
    navigate({
      to: '/planning/office',
      search: { ...search, create: undefined },
    })
  }

  const openCreateDialog = Boolean(search.create) && search.tab === 'office'

  return (
    <>
      <Link to="/planning/office" search={{ ...search, create: true }}>
        <Button className="bg-(--button-blue)">
          <Plus />
          Create Office
        </Button>
      </Link>
      {openCreateDialog && (
        <CreateOfficeDialog
          open={openCreateDialog}
          onCancel={handleCancel}
          onOpenChange={(open) => open === false && handleCancel()}
        />
      )}
    </>
  )
}
