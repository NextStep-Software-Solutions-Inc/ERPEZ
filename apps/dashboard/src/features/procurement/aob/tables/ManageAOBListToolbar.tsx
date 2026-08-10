/**
 * Manage AOB List Table Toolbar
 * Search and column visibility controls for manager/approver view
 * Note: No Create button - managers cannot create AOBs
 * 
 * Filtering is handled internally via TanStack Table's built-in filter mechanisms.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ManageAOBListToolbarProps<TData = unknown> {
  table: Table<TData>
}

export function ManageAOBListToolbar<TData = unknown>({
  table,
}: ManageAOBListToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    table.getColumn('aobNumber')?.setFilterValue(value)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        {/* Search Input */}
        <div className="flex flex-row space-x-2 flex-1 min-w-0">
          <Input
            placeholder="Search AOB number..."
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="flex-1 min-w-0 max-w-sm"
          />
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

