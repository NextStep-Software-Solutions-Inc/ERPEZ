import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import CreateDUAllocationDialog from '../dialog/CreateDUAllocationDialog'
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
  deliveryUnitId?: string
  navigate?: any
  search?: any
  onAllocateFund?: () => void
  onGlobalFilterChange?: (value: string) => void
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  deliveryUnitId,
  navigate: providedNavigate,
  search: providedSearch,
  onAllocateFund,
  onGlobalFilterChange,
}: ToolbarProps<TData>) {
  const defaultNavigate = useNavigate()
  let defaultSearch: any = {}
  try {
    defaultSearch = useSearch({ from: '/planning/fund/' })
  } catch (e) {
    defaultSearch = {}
  }

  const navigate = providedNavigate || defaultNavigate
  const search = providedSearch || defaultSearch
  const isTabMode = !!providedSearch

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  const selectedRowsCount = Object.keys(table.getState().rowSelection).length

  const updateSearch = (value: string) => {
    if (onGlobalFilterChange) {
      // Use the global filter change callback if provided (for external state management)
      onGlobalFilterChange(value)
    } else {
      // Use table's built-in global filter (for local state management)
      table.setGlobalFilter(value)
    }
  }

  // Get current global filter value from table
  const currentGlobalFilter = table.getState().globalFilter as string

  // Determine search placeholder based on table type
  const searchPlaceholder =  'Search...'

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={currentGlobalFilter || ''}
          onChange={(event) => updateSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="ghost" onClick={() => updateSearch('')}>
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
              <CreateBudgetAllocationLink
                navigate={navigate}
                search={search}
                isTabMode={isTabMode}
                deliveryUnitId={deliveryUnitId}
                onAllocateFund={onAllocateFund}
              />
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}

const CreateBudgetAllocationLink = ({
  navigate,
  search,
  isTabMode,
  deliveryUnitId,
  onAllocateFund,
}: {
  navigate: any
  search: any
  isTabMode: boolean
  deliveryUnitId?: string
  onAllocateFund?: () => void
}) => {
  const handleCancel = () => {
    navigate({
      to: isTabMode ? '/planning/fund/' : '/planning/fund/',
      search: { ...search, create: undefined },
    })
  }

  const openCreateDialog = Boolean(search.create)

  return (
    <>
      {onAllocateFund ? (
        <Button className="bg-(--button-blue)" onClick={onAllocateFund}>
          <Plus />
          Allocate Fund
        </Button>
      ) : (
        <Link
          to={isTabMode ? ('/planning/fund/' as any) : ('/planning/fund/' as any)}
          search={{ ...search, create: true, deliveryUnitId }}
        >
          <Button className="bg-(--button-blue)">
            <Plus />
            Allocate Fund
          </Button>
        </Link>
      )}
      {openCreateDialog && (
        <CreateDUAllocationDialog
          open={openCreateDialog}
          onCancel={handleCancel}
          deliveryUnitId={deliveryUnitId}
          onOpenChange={(open) => open === false && handleCancel()}
        />
      )}
    </>
  )
}
