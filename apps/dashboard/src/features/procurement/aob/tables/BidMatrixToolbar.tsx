/**
 * Bid Matrix Toolbar Component
 * Provides export, print, and action controls for bid evaluation matrix
 */

import { Button } from '@/components/ui/button'
import { Download, Printer, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Table } from '@tanstack/react-table'
import type { SupplierBid } from '../types/aobTypes'

interface BidMatrixToolbarProps {
  table: Table<SupplierBid>
  onExportCSV?: () => void
  onExportPDF?: () => void
  onPrint?: () => void
}

/**
 * Export bid matrix to CSV format
 */
function exportToCSV(table: Table<SupplierBid>) {
  const headers = table.getVisibleLeafColumns().map((col) => col.columnDef.header)
  const rows = table.getRowModel().rows.map((row) =>
    row.getVisibleCells().map((cell) => {
      const value = cell.getValue()
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      // Neutralize spreadsheet formula injection
      const safeValue = stringValue.startsWith('=') || 
                       stringValue.startsWith('+') || 
                       stringValue.startsWith('-') || 
                       stringValue.startsWith('@')
        ? `'${stringValue}`
        : stringValue
      
      // CSV escape: wrap in quotes if contains comma, quote, or newline
      if (safeValue.includes(',') || safeValue.includes('"') || safeValue.includes('\n') || safeValue.includes('\r')) {
        return `"${safeValue.replace(/"/g, '""')}"`
      }
      
      return safeValue
    })
  )

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bid-matrix-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Trigger browser print dialog
 */
function handlePrint() {
  window.print()
}

export function BidMatrixToolbar({
  table,
  onExportCSV,
  onExportPDF,
  onPrint,
}: BidMatrixToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600">
          {table.getFilteredRowModel().rows.length} suppliers
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            exportToCSV(table)
            onExportCSV?.()
          }}
          title="Export as CSV"
        >
          <Download className="w-4 h-4 mr-1" />
          CSV
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handlePrint()
            onPrint?.()
          }}
          title="Print bid matrix"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" title="More options">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implement PDF export
                onExportPDF?.()
              }}
              disabled
            >
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // TODO: Email bid matrix
              }}
            >
              Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Share bid matrix
              }}
            >
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
