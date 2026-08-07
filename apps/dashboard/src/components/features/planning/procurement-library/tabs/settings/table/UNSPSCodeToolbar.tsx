import { Table as TableType } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import { CreateUNSPSCodeDialog } from '../dialog/CreateUNSPSCodeDialog'
import type { UNSPSCode } from '../../../types'
import type { MetaActions } from '@/types/global'

interface UNSPSCodeToolbarProps {
  table: TableType<UNSPSCode>
  actions: MetaActions
  onAddUNSPSCode?: (unspscCode: any) => void
  availableParents?: UNSPSCode[]
}

export function UNSPSCodeToolbar({ table, actions, onAddUNSPSCode, availableParents = [] }: UNSPSCodeToolbarProps) {
  return (
    <div className="flex items-center w-full gap-4 flex-wrap">
      {/* Search Bar - Left */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <DebouncedInput
          placeholder="Search UNSPSC codes..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(value: any) => table.setGlobalFilter(String(value))}
          className="w-full pl-10"
        />
      </div>

      <div className="flex gap-2 ml-auto">
        {/* Add UNSPSC Code Button */}
        <CreateUNSPSCodeDialog 
          actions={actions} 
          onCreateSuccess={onAddUNSPSCode}
          availableParents={availableParents}
        />
      </div>
    </div>
  )
}