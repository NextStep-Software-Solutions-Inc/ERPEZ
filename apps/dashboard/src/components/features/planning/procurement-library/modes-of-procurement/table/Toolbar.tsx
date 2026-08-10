import { useRef } from 'react'
import { Table as TableType } from '@tanstack/react-table'
import { Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DebouncedInput from '@/components/DebouncedInput'
import PermissionCheck from '@/components/PermissionCheck'
import { CreateModeOfProcurementDialog } from '../dialog/CreateModeOfProcurementDialog'
import type { ModeOfProcurement } from '../../types'
import type { MetaActions } from '@/types/global'

interface ToolbarProps {
  table: TableType<ModeOfProcurement>
  actions: MetaActions
}

export function Toolbar({ table, actions }: ToolbarProps) {
  const csvInputRef = useRef<HTMLInputElement>(null)

  const handleExportCSV = () => {
    console.log('Exporting to CSV')
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Importing CSV:', file)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <div className="flex-1">
        <DebouncedInput
          placeholder="Search modes..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(value: any) => table.setGlobalFilter(String(value))}
          className="max-w-sm"
        />
      </div>

      <div className="flex gap-2">
        <CreateModeOfProcurementDialog actions={actions} />
        
        <PermissionCheck action="read" actions={actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </PermissionCheck>

        <PermissionCheck action="write" actions={actions}>
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => csvInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </>
        </PermissionCheck>
      </div>
    </div>
  )
}
