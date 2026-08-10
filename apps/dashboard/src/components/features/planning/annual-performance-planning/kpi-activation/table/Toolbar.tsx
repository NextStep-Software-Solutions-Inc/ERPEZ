/**
 * KPI Activation Table Toolbar
 * Step 2: Configure activated KPIs
 */

import { ChevronDown, Plus } from 'lucide-react'
import React from 'react'
import type { Table } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  searchPlaceholder?: string
  onAddClick?: () => void
}

export default function Toolbar<TData = any>({
  table,
  showColumnVisibility = true,
  searchPlaceholder = 'Search KPIs...',
  onAddClick,
}: ToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState('')
  const readonly = table.options.meta?.readonly

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    table.getColumn('name')?.setFilterValue(value)
  }

  return (
    <div className="flex flex-row space-x-2">
      <div className="flex flex-row space-x-2 flex-1">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="max-w-sm"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSearchChange('')}
            className="h-10"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onAddClick && !readonly && (
          <Button
            type="button"
            onClick={onAddClick}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add KPI
          </Button>
        )}

        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
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
      </div>
    </div>
  )
}
