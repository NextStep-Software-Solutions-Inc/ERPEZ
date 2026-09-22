import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table } from '@tanstack/react-table'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  title?: string
  className?: string
}

export function DataTableViewOptions<TData>({
  table,
  title = 'View',
  className,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs font-medium text-muted-foreground hover:text-foreground ${className || ''}`}
        >
          <Settings2 className="mr-2 h-3.5 w-3.5" />
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[280px] overflow-y-auto overflow-x-hidden">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide(),
            )
            .map((column) => {
              const meta = column.columnDef.meta as { label?: string } | undefined
              const displayName = meta?.label || column.id

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="text-xs capitalize cursor-pointer"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {displayName}
                </DropdownMenuCheckboxItem>
              )
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
