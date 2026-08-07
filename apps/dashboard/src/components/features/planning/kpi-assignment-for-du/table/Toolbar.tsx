import { ChevronDown, Plus } from 'lucide-react'
import React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import CreateKpiAssignmentDialog from '../dialog/CreateKpiAssignmentDialog'
import { openCreateDialogAtom } from '../atoms/dialogAtoms'
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

interface ToolbarProps<TData> {
  table: Table<TData>
  showColumnVisibility?: boolean
  kpiAssignmentForDuSearch?: string
}
export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
  kpiAssignmentForDuSearch,
}: ToolbarProps<TData>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/kpi/' })
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []
  const openCreateDialog = useSetAtom(openCreateDialogAtom)

  // Update URL search params when search changes
  const updateKpiAssignmentForDuSearch = (value: string) => {
    navigate({
      to: '/planning/kpi',
      search: { ...search, kpiAssignmentForDuSearch: value || undefined },
      replace: true,
    })
  }
  // Initialize table filter with kpiAssignmentForDuSearch from URL
  React.useEffect(() => {
    table
      .getColumn('officeName')
      ?.setFilterValue(kpiAssignmentForDuSearch || '')
  }, [kpiAssignmentForDuSearch, table])

  return (
    <>
      <div className="flex flex-row space-x-2 ">
        <Input
          placeholder="Search Delivery Unit..."
          value={kpiAssignmentForDuSearch || ''}
          onChange={(event) =>
            updateKpiAssignmentForDuSearch(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant={'ghost'}
          onClick={() => updateKpiAssignmentForDuSearch('')}
        >
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
            actions.includes('delete') &&
            !readonly && (
              <>
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
              </>
            )}
          {!readonly && (
            <>
              <PermissionCheck action="write" actions={actions}>
                <Button className="bg-(--button-blue)" onClick={() => openCreateDialog()}>
                  <Plus />
                  Create DU Assignment
                </Button>
              </PermissionCheck>
            </>
          )}
        </div>
      </div>
      <CreateKpiAssignmentDialog />
    </>
  )
}
