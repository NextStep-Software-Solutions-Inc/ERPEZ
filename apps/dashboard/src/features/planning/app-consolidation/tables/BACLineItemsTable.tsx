import { useState, useMemo, useEffect } from 'react'
import { Eye, Filter, ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { BACLineItem, BACWorkspace } from '../types'
import { MODE_OF_PROCUREMENT_OPTIONS } from '../constants'

interface BACLineItemsTableProps {
  workspace: BACWorkspace
  onUpdateItem?: (itemId: string, updates: Partial<BACLineItem>) => void
  readOnly?: boolean
  /// Column visibility state
  visibleColumns?: Record<string, boolean>
  onVisibleColumnsChange?: (columns: Record<string, boolean>) => void
}

// Fixed columns that cannot be hidden
// const LOCKED_COLUMNS = ['code', 'description', 'office', 'quantity', 'budget']

// All available columns
const AVAILABLE_COLUMNS = [
  { id: 'code', label: 'Item Code', locked: true },
  { id: 'description', label: 'General Description', locked: true },
  { id: 'office', label: 'PMO/End-User/Office', locked: true },
  { id: 'allotmentClass', label: 'Allotment Class', locked: true },
  { id: 'quantity', label: 'Total Quantity', locked: true },
  { id: 'budget', label: 'Estimated Budget', locked: true },
  { id: 'mop', label: 'Mode of Procurement', locked: false },
  { id: 'advertisement', label: 'Advertisement/Posting', locked: false },
  { id: 'submission', label: 'Submission of Bids', locked: false },
  { id: 'award', label: 'Notice of Award', locked: false },
  { id: 'signing', label: 'Contract Signing', locked: false },
  { id: 'remarks', label: 'Remarks', locked: false },
  { id: 'epa', label: 'EPA', locked: false },
]

type SortOrder = 'asc' | 'desc' | null
type SortableColumn = 'code' | 'description' | 'quantity' | 'budget' | 'mop' | 'advertisement' | 'submission' | 'award' | 'signing'

interface SortState {
  column: SortableColumn | null
  order: SortOrder
}

/**
 * BACLineItemsTable - Budget Alignment & Procurement Line Items Editor
 *
 * Displays consolidated BAC line items with:
 * - Locked columns: Item Code, Description, Office, Quantity, Budget
 * - Editable columns: MoP, Bidding Schedule (4 dates), Remarks, EPA toggle
 * - Column visibility control
 * - Sorting and filtering capabilities
 * - Hybrid date/text inputs for bidding schedule columns
 *
 * Features:
 * - Hide/show columns dynamically
 * - Sort by any column
 * - Filter EPA-tagged items
 * - Inline editing for supported columns
 * - Free-text or date input flexibility
 *
 * Documentation: documentations/bac-line-items-table.md
 */
export function BACLineItemsTable({
  workspace,
  onUpdateItem,
  readOnly = false,
  visibleColumns: controlledVisibleColumns,
  onVisibleColumnsChange,
}: BACLineItemsTableProps) {
  const [sortState, setSortState] = useState<SortState>({ column: null, order: null })
  const [filterEPA, setFilterEPA] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    controlledVisibleColumns || AVAILABLE_COLUMNS.reduce((acc, col) => {
      acc[col.id] = !col.locked ? true : true // All columns visible by default
      return acc
    }, {} as Record<string, boolean>)
  )

  // Sync local state when controlledVisibleColumns prop changes
  // This enables the component to work as a controlled component where parent changes are reflected
  useEffect(() => {
    if (controlledVisibleColumns) {
      setVisibleColumns(controlledVisibleColumns)
    }
  }, [controlledVisibleColumns])

  // Filter items
  const filteredItems = useMemo(() => {
    let items = workspace.lineItems || []
    if (filterEPA) {
      items = items.filter((item) => item.eligibleForEPA)
    }
    return items
  }, [workspace.lineItems, filterEPA])

  // Sort items
  const sortedItems = useMemo(() => {
    if (!sortState.column || !sortState.order) return filteredItems

    const sorted = [...filteredItems].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortState.column) {
        case 'code':
          aValue = a.id
          bValue = b.id
          break
        case 'description':
          aValue = a.unit
          bValue = b.unit
          break
        case 'quantity':
          aValue = a.quantity
          bValue = b.quantity
          break
        case 'budget':
          aValue = a.totalAmount
          bValue = b.totalAmount
          break
        case 'mop':
          aValue = a.modeOfProcurement || ''
          bValue = b.modeOfProcurement || ''
          break
        case 'advertisement':
          aValue = a.milestones?.advertisementDate || ''
          bValue = b.milestones?.advertisementDate || ''
          break
        case 'submission':
          aValue = a.milestones?.submissionDate || ''
          bValue = b.milestones?.submissionDate || ''
          break
        case 'award':
          aValue = a.milestones?.noticeOfAwardDate || ''
          bValue = b.milestones?.noticeOfAwardDate || ''
          break
        case 'signing':
          aValue = a.milestones?.contractSigningDate || ''
          bValue = b.milestones?.contractSigningDate || ''
          break
        default:
          return 0
      }

      if (typeof aValue === 'string') {
        return sortState.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      return sortState.order === 'asc' ? aValue - bValue : bValue - aValue
    })

    return sorted
  }, [filteredItems, sortState])

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    const updated = { ...visibleColumns, [columnId]: visible }
    setVisibleColumns(updated)
    onVisibleColumnsChange?.(updated)
  }

  const handleSort = (column: SortableColumn) => {
    if (sortState.column === column) {
      // Toggle sort order
      if (sortState.order === 'asc') {
        setSortState({ column, order: 'desc' })
      } else if (sortState.order === 'desc') {
        setSortState({ column: null, order: null })
      }
    } else {
      setSortState({ column, order: 'asc' })
    }
  }

  const handleUpdateItem = (itemId: string, updates: Partial<BACLineItem>) => {
    if (!readOnly) {
      onUpdateItem?.(itemId, updates)
    }
  }

  const handleUpdateMilestone = (
    itemId: string,
    field: 'advertisementDate' | 'submissionDate' | 'noticeOfAwardDate' | 'contractSigningDate',
    value: string
  ) => {
    const item = workspace.lineItems.find((i) => i.id === itemId)
    if (item) {
      const milestones: NonNullable<BACLineItem['milestones']> = {
        advertisementDate: item.milestones?.advertisementDate || '',
        submissionDate: item.milestones?.submissionDate || '',
        noticeOfAwardDate: item.milestones?.noticeOfAwardDate || '',
        contractSigningDate: item.milestones?.contractSigningDate || '',
      }
      milestones[field] = value

      handleUpdateItem(itemId, {
        milestones,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Visibility Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {AVAILABLE_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={visibleColumns[col.id] ?? true}
                  onCheckedChange={(checked) =>
                    handleColumnVisibilityChange(col.id, checked === true)
                  }
                  disabled={col.locked}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* EPA Filter */}
          <Button
            variant={filterEPA ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterEPA(!filterEPA)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {filterEPA ? 'Showing EPA' : 'Filter EPA'}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {sortedItems.length} of {workspace.lineItems?.length || 0} items
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-to-r from-orange-50 to-orange-50">
            <TableRow className="hover:bg-transparent">
              {/* Locked Columns */}
              {(visibleColumns['code'] ?? true) && (
                <TableHead className="w-24 font-semibold text-orange-900">
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 hover:text-orange-700"
                  >
                    Code
                    {sortState.column === 'code' && (
                      <ArrowUpDown className={`w-4 h-4 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}

              {(visibleColumns['description'] ?? true) && (
                <TableHead className="font-semibold text-orange-900">
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-1 hover:text-orange-700"
                  >
                    Description
                    {sortState.column === 'description' && (
                      <ArrowUpDown className={`w-4 h-4 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}


              {(visibleColumns['office'] ?? true) && (
                <TableHead className="w-32 font-semibold text-orange-900">Office</TableHead>
              )}

              {(visibleColumns['allotmentClass'] ?? true) && (
                <TableHead className="w-28 font-semibold text-orange-900">Allotment Class</TableHead>
              )}

              {(visibleColumns['quantity'] ?? true) && (
                <TableHead className="text-right w-20 font-semibold text-orange-900">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="flex items-center justify-end gap-1 hover:text-orange-700 ml-auto"
                  >
                    Qty
                    {sortState.column === 'quantity' && (
                      <ArrowUpDown className={`w-4 h-4 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}

              {(visibleColumns['budget'] ?? true) && (
                <TableHead className="text-right w-28 font-semibold text-orange-900">
                  <button
                    onClick={() => handleSort('budget')}
                    className="flex items-center justify-end gap-1 hover:text-orange-700 ml-auto"
                  >
                    Budget
                    {sortState.column === 'budget' && (
                      <ArrowUpDown className={`w-4 h-4 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}

              {/* Editable Columns */}
              {(visibleColumns['mop'] ?? true) && (
                <TableHead className="w-28 font-semibold text-orange-900">
                  <button
                    onClick={() => handleSort('mop')}
                    className="flex items-center gap-1 hover:text-orange-700"
                  >
                    MoP
                    {sortState.column === 'mop' && (
                      <ArrowUpDown className={`w-4 h-4 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}

              {(visibleColumns['advertisement'] ?? true) && (
                <TableHead className="w-32 font-semibold text-gray-700 text-xs">
                  <button
                    onClick={() => handleSort('advertisement')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Advertisement
                    {sortState.column === 'advertisement' && (
                      <ArrowUpDown className={`w-3 h-3 ${sortState.order === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </TableHead>
              )}

              {(visibleColumns['submission'] ?? true) && (
                <TableHead className="w-32 font-semibold text-gray-700 text-xs">Submission</TableHead>
              )}

              {(visibleColumns['award'] ?? true) && (
                <TableHead className="w-32 font-semibold text-gray-700 text-xs">Award</TableHead>
              )}

              {(visibleColumns['signing'] ?? true) && (
                <TableHead className="w-32 font-semibold text-gray-700 text-xs">Signing</TableHead>
              )}

              {(visibleColumns['remarks'] ?? true) && (
                <TableHead className="w-40 font-semibold text-gray-700 text-xs">Remarks</TableHead>
              )}

              {(visibleColumns['epa'] ?? true) && (
                <TableHead className="w-16 text-center font-semibold text-gray-700">EPA</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Object.values(visibleColumns).filter(Boolean).length}
                  className="text-center text-gray-500 py-8"
                >
                  No line items found
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {/* Locked Columns */}
                  {(visibleColumns['code'] ?? true) && (
                    <TableCell className="font-mono text-xs bg-gray-50">
                      {item.id}
                    </TableCell>
                  )}

                  {(visibleColumns['description'] ?? true) && (
                    <TableCell className="text-sm bg-gray-50">
                      {item.unit}
                    </TableCell>
                  )}


                  {(visibleColumns['office'] ?? true) && (
                    <TableCell className="text-sm bg-gray-50">{item.office || '—'}</TableCell>
                  )}

                  {(visibleColumns['allotmentClass'] ?? true) && (
                    <TableCell className="text-sm bg-gray-50">{item.allotmentClass || '—'}</TableCell>
                  )}

                  {(visibleColumns['quantity'] ?? true) && (
                    <TableCell className="text-right font-medium bg-gray-50">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                  )}

                  {(visibleColumns['budget'] ?? true) && (
                    <TableCell className="text-right font-medium bg-gray-50">
                      ₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                    </TableCell>
                  )}

                  {/* Editable Columns */}
                  {(visibleColumns['mop'] ?? true) && (
                    <TableCell className="text-sm">
                      {readOnly ? (
                        <span>{item.modeOfProcurement || '—'}</span>
                      ) : (
                        <Select
                          value={item.modeOfProcurement || ''}
                          onValueChange={(value) =>
                            handleUpdateItem(item.id, { modeOfProcurement: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select MoP" />
                          </SelectTrigger>
                          <SelectContent>
                            {MODE_OF_PROCUREMENT_OPTIONS.map((mop) => (
                              <SelectItem key={mop} value={mop}>
                                {mop}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}

                  {/* Hybrid Date/Text Inputs */}
                  {(visibleColumns['advertisement'] ?? true) && (
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">{item.milestones?.advertisementDate || '—'}</span>
                      ) : (
                        <Input
                          type="text"
                          placeholder="MM/YYYY or N/A"
                          value={item.milestones?.advertisementDate || ''}
                          onChange={(e) =>
                            handleUpdateMilestone(item.id, 'advertisementDate', e.target.value)
                          }
                          className="h-8 text-xs"
                          title="Enter date as MM/YYYY, N/A, or multiple dates: 01/2024, 07/2024"
                        />
                      )}
                    </TableCell>
                  )}

                  {(visibleColumns['submission'] ?? true) && (
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">{item.milestones?.submissionDate || '—'}</span>
                      ) : (
                        <Input
                          type="text"
                          placeholder="MM/YYYY or N/A"
                          value={item.milestones?.submissionDate || ''}
                          onChange={(e) =>
                            handleUpdateMilestone(item.id, 'submissionDate', e.target.value)
                          }
                          className="h-8 text-xs"
                          title="Enter date as MM/YYYY, N/A, or multiple dates"
                        />
                      )}
                    </TableCell>
                  )}

                  {(visibleColumns['award'] ?? true) && (
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">{item.milestones?.noticeOfAwardDate || '—'}</span>
                      ) : (
                        <Input
                          type="text"
                          placeholder="MM/YYYY or N/A"
                          value={item.milestones?.noticeOfAwardDate || ''}
                          onChange={(e) =>
                            handleUpdateMilestone(item.id, 'noticeOfAwardDate', e.target.value)
                          }
                          className="h-8 text-xs"
                          title="Enter date as MM/YYYY, N/A, or multiple dates"
                        />
                      )}
                    </TableCell>
                  )}

                  {(visibleColumns['signing'] ?? true) && (
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">
                          {item.milestones?.contractSigningDate || '—'}
                        </span>
                      ) : (
                        <Input
                          type="text"
                          placeholder="MM/YYYY or N/A"
                          value={item.milestones?.contractSigningDate || ''}
                          onChange={(e) =>
                            handleUpdateMilestone(
                              item.id,
                              'contractSigningDate',
                              e.target.value
                            )
                          }
                          className="h-8 text-xs"
                          title="Enter date as MM/YYYY, N/A, or multiple dates"
                        />
                      )}
                    </TableCell>
                  )}

                  {(visibleColumns['remarks'] ?? true) && (
                    <TableCell className="text-sm max-w-xs">
                      {readOnly ? (
                        <span className="truncate">{item.remarks || '—'}</span>
                      ) : (
                        <Input
                          type="text"
                          placeholder="Add remarks..."
                          value={item.remarks || ''}
                          onChange={(e) => handleUpdateItem(item.id, { remarks: e.target.value })}
                          className="h-8 text-xs"
                        />
                      )}
                    </TableCell>
                  )}

                  {(visibleColumns['epa'] ?? true) && (
                    <TableCell className="text-center">
                      {readOnly ? (
                        <Badge
                          variant={item.eligibleForEPA ? 'soft' : 'outline'}
                          color={item.eligibleForEPA ? 'success' : 'secondary'}
                        >
                          {item.eligibleForEPA ? '✓' : '—'}
                        </Badge>
                      ) : (
                        <Checkbox
                          checked={item.eligibleForEPA}
                          onCheckedChange={(checked) =>
                            handleUpdateItem(item.id, {
                              eligibleForEPA: checked === true,
                            })
                          }
                          disabled={readOnly}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Column Status Legend */}
      <div className="text-xs text-gray-600 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
          <span>Locked (cannot edit)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span>Editable {readOnly ? '(read-only mode)' : ''}</span>
        </div>
      </div>
    </div>
  )
}
