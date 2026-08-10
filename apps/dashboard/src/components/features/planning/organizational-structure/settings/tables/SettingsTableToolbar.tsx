import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Settings2Icon } from 'lucide-react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useAtom } from 'jotai'
import { tableSelectedRowsAtom } from '../../atoms'

interface SettingsTableToolbarProps<TData> {
  table: Table<TData>
  onCreateClick: () => void
  onDeleteClick: () => void
  searchPlaceholder?: string
  showColumnVisibility?: boolean
}

export function SettingsTableToolbar<TData>({
  table,
  onCreateClick,
  onDeleteClick,
  searchPlaceholder = 'Search...',
  showColumnVisibility = true,
}: SettingsTableToolbarProps<TData>) {
  const [selectedRows] = useAtom(tableSelectedRowsAtom)
  const hasSelectedRows = Object.keys(selectedRows).length > 0

  const { value: searchValue, onChange: setSearchValue } = useDebouncedSearch(
    table,
    'name',
    400
  )

  return (
    <div className="flex items-center gap-4 py-3 w-full">
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="max-w-xs"
      />

      <div className="flex-1" />

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={onCreateClick}
          className="h-9 space-x-2 gap-2"
        >
        <Plus className="h-4 w-4" />
          Add
        </Button>

        {hasSelectedRows && (
          <Button
            size="sm"
            onClick={onDeleteClick}
            className="h-9"
          >
            Delete ({Object.keys(selectedRows).length})
          </Button>
        )}

        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Settings2Icon className="w-4 h-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
