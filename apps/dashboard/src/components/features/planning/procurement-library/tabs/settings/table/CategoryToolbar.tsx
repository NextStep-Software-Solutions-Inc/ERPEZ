import { Table as TableType } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import { CreateCategoryDialog } from '../dialog/CreateCategoryDialog'
import type { Category } from '../../../types'
import type { MetaActions } from '@/types/global'
interface CategoryToolbarProps {
  table: TableType<Category>
  actions: MetaActions
  onAddCategory?: (data: any) => void
  onRefresh?: () => void
}
export function CategoryToolbar({ table, actions, onAddCategory, onRefresh }: CategoryToolbarProps) {
  return (
    <div className="flex items-center w-full gap-4 flex-wrap">
      {/* Search Bar - Left */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <DebouncedInput
          placeholder="Search categories..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(value: any) => table.setGlobalFilter(String(value))}
          className="w-full pl-10"
        />
      </div>

      <div className="flex gap-2 ml-auto">
        {/* Add Category Button */}
        <CreateCategoryDialog actions={actions} onCreateSuccess={onAddCategory} onRefresh={onRefresh} />
      </div>
    </div>
  )
}