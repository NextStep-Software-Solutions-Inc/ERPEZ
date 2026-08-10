import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import CreateClusterDialog from '../dialog/CreateOrganizationalClusterDialog'
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

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  clusterSearch?: string
  navigate?: any
  search?: any
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  clusterSearch,
  navigate: providedNavigate,
  search: providedSearch,
}: ToolbarProps<TData>) {
  const navigate = providedNavigate || useNavigate()
  const search = providedSearch || useSearch({ from: '/planning/office/' })
  const isTabMode = !!providedSearch

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  // Force re-render when column visibility changes
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  // Get selected rows count from table state to ensure reactivity
  const selectedRowsCount = Object.keys(table.getState().rowSelection).length

  // Update URL search params when search changes
  const updateClusterSearch = (value: string) => {
    if (isTabMode) {
      navigate({
        to: '/planning/office',
        search: { ...search, clusterSearch: value || undefined },
        replace: true,
      })
    } else {
      navigate({
        to: '/planning/office',
        search: { ...search, clusterNameSearch: value || undefined },
        replace: true,
      })
    }
  }

  // Initialize table filter with clusterSearch from URL
  React.useEffect(() => {
    table.getColumn('name')?.setFilterValue(clusterSearch || '')
  }, [clusterSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search Cluster..."
          value={clusterSearch || ''}
          onChange={(event) => updateClusterSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="ghost" onClick={() => updateClusterSearch('')}>
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
                  ? `${
                      table.getFilteredSelectedRowModel().rows.length > 1
                        ? `${table.getFilteredSelectedRowModel().rows.length} Rows`
                        : `${table.getFilteredSelectedRowModel().rows.length} Row`
                    }`
                  : ''}
              </Button>
            </PermissionCheck>
          )}

          {!readonly && (
            <PermissionCheck action="write" actions={actions}>
              <CreateClusterLink
                navigate={navigate}
                search={search}
                isTabMode={isTabMode}
              />
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}

const CreateClusterLink = ({
  navigate,
  search,
  isTabMode,
}: {
  navigate: any
  search: any
  isTabMode: boolean
}) => {
  const handleCancel = () => {
    navigate({
      to: isTabMode ? '/planning/office' : '/planning/office',
      search: { ...search, create: undefined },
    })
  }

  const openCreateDialog = Boolean(search.create)

  return (
    <>
      <Link
        to={isTabMode ? '/planning/office' : '/planning/office'}
        search={{ ...search, create: true }}
      >
        <Button className="bg-(--button-blue)">
          <Plus />
          Create Organizational Cluster
        </Button>
      </Link>
      {openCreateDialog && (
        <CreateClusterDialog
          open={openCreateDialog}
          onCancel={handleCancel}
          onOpenChange={(open) => open === false && handleCancel()}
        />
      )}
    </>
  )
}
