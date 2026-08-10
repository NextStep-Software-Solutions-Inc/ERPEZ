import { ChevronDown, Plus } from 'lucide-react'
import React from 'react'
import CreateEvaluationDialog from '../dialog/CreateEvaluationDialog'
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
}
export default function Toolbar<TData = any>({
  table,
  showColumnVisibility,
}: ToolbarProps<TData>) {
  const readonly = table.options.meta?.readonly
  const actions = table.options.meta?.actions ?? []
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  return (
    <>
      <div className="flex flex-row space-x-2 ">
        <Input
          placeholder="Search Evaluation..."
          value={
            (table.getColumn('deliveryUnit')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('deliveryUnit')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant={'ghost'}
          onClick={() => {
            table.getColumn('deliveryUnit')?.setFilterValue('')
          }}
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
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            actions?.includes('delete') &&
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
            <PermissionCheck action="write" actions={actions}>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-[var(--button-blue)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Evaluation
              </Button>
              <CreateEvaluationDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              />
            </PermissionCheck>
          )}
        </div>
      </div>
    </>
  )
}
