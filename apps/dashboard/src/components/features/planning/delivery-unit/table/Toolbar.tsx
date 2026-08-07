import React from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import CreateDeliveryUnitDialog from '../dialog/CreateDeliveryUnitDialog'
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
import { Route } from '@/routes/v1/planning/office/$deliveryUnitId'

interface ToolbarProps<TData> {
  table: Table<TData>
  showColumnVisibility?: boolean
  deliveryUnitSearch?: string
  navigate?: any
  search?: any
  officeId?: string
  parentId?: string
}

export default function Toolbar<TData>({
  table,
  showColumnVisibility,
  deliveryUnitSearch,
  navigate: providedNavigate,
  search: providedSearch,
  officeId,
  parentId,
}: ToolbarProps<TData>) {
  const navigate = providedNavigate || useNavigate()
  // TODO: Use Route.id when the route is created
  // const search = providedSearch || useSearch({ from: Route.id })
  const search = providedSearch || {}
  const isTabMode = !!providedSearch

  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []

  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  const [localSearch, setLocalSearch] = React.useState('')

  const selectedRowsCount = Object.keys(table.getState().rowSelection).length

  const updateDeliveryUnitSearch = (value: string) => {
    if (isTabMode) {
      navigate({
        to: '/planning/office',
        search: { ...search, deliveryUnitSearch: value || undefined },
        replace: true,
      })
    } else {
      setLocalSearch(value)
    }
  }

  const currentSearch = isTabMode ? deliveryUnitSearch : localSearch

  React.useEffect(() => {
    table.setGlobalFilter(currentSearch || '')
  }, [currentSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Input
          placeholder={
            parentId ? 'Search Sub-Delivery Unit...' : 'Search Delivery Unit...'
          }
          value={currentSearch || ''}
          onChange={(event) => updateDeliveryUnitSearch(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="ghost" onClick={() => updateDeliveryUnitSearch('')}>
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
              <CreateDeliveryUnitLink officeId={officeId} parentId={parentId} />
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}

const CreateDeliveryUnitLink = ({
  officeId,
  parentId,
}: {
  officeId?: string
  parentId?: string
}) => {
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false)

  const handleCancel = () => {
    setOpenCreateDialog(false)
  }

  return (
    <>
      <Button
        className="bg-(--button-blue)"
        onClick={() => setOpenCreateDialog(true)}
      >
        <Plus />
        {parentId ? 'Add Sub-Delivery Unit' : 'Create Delivery Unit'}
      </Button>

      {openCreateDialog && (
        <CreateDeliveryUnitDialog
          open={openCreateDialog}
          onCancel={handleCancel}
          onOpenChange={setOpenCreateDialog}
          officeId={officeId}
          parentId={parentId}
        />
      )}
    </>
  )
}
