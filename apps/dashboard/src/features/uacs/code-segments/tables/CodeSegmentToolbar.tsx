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

interface CodeSegmentToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  searchPlaceholder?: string
  searchColumn?: string
  onAdd?: () => void
  addLabel?: string
}

export default function CodeSegmentToolbar<TData = any>({
  table,
  showColumnVisibility = true,
  searchPlaceholder = 'Search...',
  searchColumn = 'name',
  onAdd,
  addLabel = 'Add',
}: CodeSegmentToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    table.getColumn(searchColumn)?.setFilterValue(value)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex flex-row space-x-2 flex-1 min-w-0">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="flex-1 min-w-0 max-w-sm"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSearchChange('')}
              className="h-10 flex-shrink-0"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 flex-shrink-0">
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
