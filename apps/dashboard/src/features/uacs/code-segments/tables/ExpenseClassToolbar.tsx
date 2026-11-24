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

interface ExpenseClassToolbarProps<TData = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
  searchPlaceholder?: string
  onAdd?: () => void
  addLabel?: string
  /** When provided, overrides client-side column filtering with a server-side search callback */
  onSearch?: (value: string) => void
  /** Controlled search value (used together with onSearch for server-side search) */
  searchValue?: string
}

export default function ExpenseClassToolbar<TData = any>({
  table,
  showColumnVisibility = true,
  searchPlaceholder = 'Search Expense Class...',
  onAdd,
  addLabel = 'Add Expense Class',
  onSearch,
  searchValue,
}: ExpenseClassToolbarProps<TData>) {
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue ?? '')
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (onSearch !== undefined && searchValue !== undefined && searchValue !== localSearchValue) {
      setLocalSearchValue(searchValue)
    }
  }, [searchValue])

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value)
      } else {
        table.getColumn('name')?.setFilterValue(value)
      }
    }, 400)
  }

  const handleClear = () => {
    setLocalSearchValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (onSearch) {
      onSearch('')
    } else {
      table.getColumn('name')?.setFilterValue('')
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
