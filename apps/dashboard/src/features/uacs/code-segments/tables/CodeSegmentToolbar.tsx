import { ChevronDown, Plus } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
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
  /** When provided, overrides client-side column filtering with a server-side search callback */
  onSearch?: (value: string) => void
  /** Controlled search value (used together with onSearch for server-side search) */
  searchValue?: string
}

export default function CodeSegmentToolbar<TData = any>({
  table,
  showColumnVisibility = true,
  searchPlaceholder = 'Search...',
  searchColumn = 'name',
  onAdd,
  addLabel = 'Add',
  onSearch,
  searchValue,
}: CodeSegmentToolbarProps<TData>) {
  // Local state always reflects what the user typed (instant feedback)
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue ?? '')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync controlled searchValue into local state when parent resets it (e.g. on clear)
  useEffect(() => {
    if (onSearch !== undefined && searchValue !== undefined && searchValue !== localSearchValue) {
      setLocalSearchValue(searchValue)
    }
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    // Always update the input immediately for snappy UX
    setLocalSearchValue(value)

    // Debounce the actual filter/search action (400ms)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        // Server-side search: delegate to parent
        onSearch(value)
      } else {
        // Client-side search: filter via TanStack table column
        table.getColumn(searchColumn)?.setFilterValue(value)
      }
    }, 400)
  }

  const handleClear = () => {
    setLocalSearchValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (onSearch) {
      onSearch('')
    } else {
      table.getColumn(searchColumn)?.setFilterValue('')
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex flex-row space-x-2 flex-1 min-w-0">
          <Input
            placeholder={searchPlaceholder}
            value={localSearchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="flex-1 min-w-0 max-w-sm"
          />
          {localSearchValue && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
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
