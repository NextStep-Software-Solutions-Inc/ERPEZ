import { useRef, useState } from 'react'
import { Table as TableType } from '@tanstack/react-table'
import { Download, Upload, Settings2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import DebouncedInput from '@/components/DebouncedInput'
import PermissionCheck from '@/components/PermissionCheck'
import { CreatePriceCatalogueDialog } from '../dialog/CreatePriceCatalogueDialog'
import type { PriceCatalogueItem } from '../../types'
import type { MetaActions } from '@/types/global'

interface ToolbarProps {
  table: TableType<PriceCatalogueItem>
  actions: MetaActions
  selectedFiscalYearId?: string
  onSelectedFiscalYearChange?: (value: string) => void
  onAddItem?: (item: any) => void
  availableFiscalYears?: Array<{ value: string; label: string }>
}

export function Toolbar({
  table,
  actions,
  selectedFiscalYearId,
  onSelectedFiscalYearChange,
  onAddItem,
  availableFiscalYears = [],
}: ToolbarProps) {
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const [columnVisibilityUpdate, setColumnVisibilityUpdate] = useState(0)

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting to CSV')
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement CSV import
      console.log('Importing CSV:', file)
    }
  }

  const handleColumnToggle = (columnId: string) => {
    const column = table.getColumn(columnId)
    if (column) {
      column.toggleVisibility()
      setColumnVisibilityUpdate((prev) => prev + 1)
    }
  }

  return (
    <div className="flex items-center w-full gap-4 flex-wrap">
      {/* Search Bar - Left */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <DebouncedInput
          placeholder="Search by item name"
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(value: any) => table.setGlobalFilter(String(value))}
          className="w-full pl-10"
        />
      </div>

      {/* Fiscal Year Filter */}
      {selectedFiscalYearId && onSelectedFiscalYearChange && (
        <Select
          value={selectedFiscalYearId}
          onValueChange={onSelectedFiscalYearChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Fiscal Year" />
          </SelectTrigger>
          <SelectContent>
            {availableFiscalYears.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex gap-2 ml-auto">
        {/* Add Price Button */}
        <CreatePriceCatalogueDialog
          actions={actions}
          onCreateSuccess={onAddItem}
        />

        {/* Column Visibility Toggle */}
        <DropdownMenu
          open={isColumnMenuOpen}
          onOpenChange={setIsColumnMenuOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-semibold">
              Toggle Columns
            </div>
            <DropdownMenuSeparator />
            {columnVisibilityUpdate >= 0 &&
              table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const isVisible = column.getIsVisible()
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={isVisible}
                      onCheckedChange={() => handleColumnToggle(column.id)}
                      className="capitalize"
                    >
                      {column.columnDef.header
                        ? typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
          </DropdownMenuContent>
        </DropdownMenu>

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
