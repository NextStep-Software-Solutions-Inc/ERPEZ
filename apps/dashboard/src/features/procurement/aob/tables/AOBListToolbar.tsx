/**
 * AOB List Table Toolbar
 * Search, filter, column visibility, and create button
 */

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AOBListToolbarProps<TData = unknown> {
  table: Table<TData>
  onSearch?: (value: string) => void
  onFilterByStatus?: (status: string) => void
  onCreate?: () => void
}

export function AOBListToolbar<TData = unknown>({
  table,
  onSearch,
  onCreate,
}: AOBListToolbarProps<TData>) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    table.getColumn('aobNumber')?.setFilterValue(value)
    onSearch?.(value)
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

          {/* Create Button */}
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create AOB
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
