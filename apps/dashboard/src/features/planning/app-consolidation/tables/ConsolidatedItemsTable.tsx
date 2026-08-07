import { useState, useMemo, useEffect } from 'react'
import { Eye, Filter, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'
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
import type { ConsolidatedLineItem, BACWorkspace } from '../types'
import { MODE_OF_PROCUREMENT_OPTIONS } from '../constants'
import { MoPBadge } from '../components/MoPBadge'
import { HybridScheduleInput } from '../components/HybridScheduleInput'

interface ConsolidatedItemsTableProps {
  workspace: BACWorkspace
  onUpdateItem?: (itemId: string, updates: Partial<ConsolidatedLineItem>) => void
  readOnly?: boolean
  visibleColumns?: Record<string, boolean>
  onVisibleColumnsChange?: (columns: Record<string, boolean>) => void
  unsavedChanges?: Set<string> // Track which items have unsaved changes
}

// Available columns for consolidated items
const AVAILABLE_COLUMNS = [
  { id: 'code', label: 'Item Code', locked: true },
  { id: 'description', label: 'General Description', locked: true },
  { id: 'office', label: 'PMO/End-User/Office', locked: true },
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
type SortableColumn = 'code' | 'description' | 'quantity' | 'budget' | 'mop'

interface SortState {
  column: SortableColumn | null
  order: SortOrder
}

/**
 * ConsolidatedItemsTable - Consolidated APP Line Items with Lineage Display
 *
 * Displays consolidated BAC line items with complete lineage tracing:
 * - Locked columns: Item Code, Description, Office, Quantity, Budget
 * - Editable columns: MoP, Bidding Schedule (4 dates), Remarks, EPA toggle
 * - Expandable rows showing lineage details (which PPMPs contributed)
 * - Column visibility control
 * - Sorting and filtering capabilities
 * - Unsaved changes tracking per row
 *
 * Features:
 * - Hide/show columns dynamically
 * - Sort by any column (3-state: asc/desc/none)
 * - Filter EPA-tagged items
 * - Expand/collapse lineage details
 * - Inline editing for supported columns
 * - Free-text or date input flexibility
 * - Unsaved changes visual indicator (badge on row)
 *
 * Documentation: documentations/consolidated-items-table.md
 */
export function ConsolidatedItemsTable({
  workspace,
  onUpdateItem,
  readOnly = false,
  visibleColumns: controlledVisibleColumns,
  onVisibleColumnsChange,
  unsavedChanges,
}: ConsolidatedItemsTableProps) {
  const [sortState, setSortState] = useState<SortState>({ column: null, order: null })
  const [filterEPA, setFilterEPA] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    controlledVisibleColumns || AVAILABLE_COLUMNS.reduce((acc, col) => {
      acc[col.id] = true // All columns visible by default
      return acc
    }, {} as Record<string, boolean>)
  )

  // Sync local state when controlledVisibleColumns prop changes
  useEffect(() => {
    if (controlledVisibleColumns) {
      setVisibleColumns(controlledVisibleColumns)
    }
  }, [controlledVisibleColumns])

  // Filter items
  const filteredItems = useMemo(() => {
    let items = (workspace.lineItems || []) as ConsolidatedLineItem[]
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
          aValue = a.description || ''
          bValue = b.description || ''
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
      if (sortState.order === 'asc') {
        setSortState({ column, order: 'desc' })
      } else if (sortState.order === 'desc') {
        setSortState({ column: null, order: null })
      }
    } else {
      setSortState({ column, order: 'asc' })
    }
  }

  const toggleRowExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedRows(newExpanded)
  }

  const handleUpdateItem = (itemId: string, updates: Partial<ConsolidatedLineItem>) => {
    if (!readOnly) {
      onUpdateItem?.(itemId, updates)
    }
  }

  const handleUpdateMilestone = (
    itemId: string,
    field: 'advertisementDate' | 'submissionDate' | 'noticeOfAwardDate' | 'contractSigningDate',
    value: string
  ) => {
    const item = workspace.lineItems?.find((i) => i.id === itemId)
    if (item) {
      const milestones: NonNullable<ConsolidatedLineItem['milestones']> = {
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
              {/* Expander */}
              <TableHead className="w-10"></TableHead>

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
                <TableHead className="w-32 font-semibold text-gray-700 text-xs">Advertisement</TableHead>
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
                  colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                  className="text-center text-gray-500 py-8"
                >
                  No consolidated items found
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => {
                const isExpanded = expandedRows.has(item.id)
                const hasLineage = (item as ConsolidatedLineItem).lineageDetails?.length > 0
                const hasUnsavedChanges = unsavedChanges?.has(item.id)

                return (
                  <tbody key={item.id}>
                    <TableRow className="border-b hover:bg-gray-50 transition-colors">
                      {/* Expander */}
                      <TableCell className="w-10 p-2">
                        {hasLineage && (
                          <button
                            onClick={() => toggleRowExpansion(item.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </TableCell>

                      {/* Locked Columns */}
                      {(visibleColumns['code'] ?? true) && (
                        <TableCell className="font-mono text-xs bg-gray-50">
                          {item.id}
                        </TableCell>
                      )}

                      {(visibleColumns['description'] ?? true) && (
                        <TableCell className="text-sm bg-gray-50 max-w-xs">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              {item.description}
                            </div>
                            {hasUnsavedChanges && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Unsaved
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {(visibleColumns['office'] ?? true) && (
                        <TableCell className="text-sm bg-gray-50">{item.office || '—'}</TableCell>
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
                            <MoPBadge mop={item.modeOfProcurement || 'N/A'} />
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
                                {MODE_OF_PROCUREMENT_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      )}

                      {(visibleColumns['advertisement'] ?? true) && (
                        <TableCell>
                          <HybridScheduleInput
                            value={item.milestones?.advertisementDate}
                            onChange={(value) =>
                              handleUpdateMilestone(item.id, 'advertisementDate', value)
                            }
                            placeholder="MM/YYYY"
                            disabled={readOnly}
                            readOnly={readOnly}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                      )}

                      {(visibleColumns['submission'] ?? true) && (
                        <TableCell>
                          <HybridScheduleInput
                            value={item.milestones?.submissionDate}
                            onChange={(value) =>
                              handleUpdateMilestone(item.id, 'submissionDate', value)
                            }
                            placeholder="MM/YYYY"
                            disabled={readOnly}
                            readOnly={readOnly}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                      )}

                      {(visibleColumns['award'] ?? true) && (
                        <TableCell>
                          <HybridScheduleInput
                            value={item.milestones?.noticeOfAwardDate}
                            onChange={(value) =>
                              handleUpdateMilestone(item.id, 'noticeOfAwardDate', value)
                            }
                            placeholder="MM/YYYY"
                            disabled={readOnly}
                            readOnly={readOnly}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                      )}

                      {(visibleColumns['signing'] ?? true) && (
                        <TableCell>
                          <HybridScheduleInput
                            value={item.milestones?.contractSigningDate}
                            onChange={(value) =>
                              handleUpdateMilestone(item.id, 'contractSigningDate', value)
                            }
                            placeholder="MM/YYYY"
                            disabled={readOnly}
                            readOnly={readOnly}
                            className="h-8 text-xs"
                          />
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

                    {/* Expanded Lineage Row */}
                    {isExpanded && hasLineage && (
                      <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors">
                        <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}>
                          <div className="p-4 space-y-3">
                            <div className="font-semibold text-sm text-gray-900">Consolidation Lineage</div>
                            <div className="space-y-2">
                              {(item as ConsolidatedLineItem).lineageDetails?.map((lineage, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-white border border-gray-200 rounded-lg text-sm"
                                >
                                  <div className="grid grid-cols-6 gap-2">
                                    <div>
                                      <span className="text-gray-600">PPMP:</span>
                                      <div className="font-mono text-xs">{lineage.ppmpNumber}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Office:</span>
                                      <div className="font-medium">{lineage.office}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Qty:</span>
                                      <div className="font-medium">{lineage.quantity}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Unit Cost:</span>
                                      <div className="font-medium">
                                        ₱{lineage.unitCost.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Total:</span>
                                      <div className="font-medium">
                                        ₱{lineage.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">% of Total:</span>
                                      <div className="font-medium text-orange-600">{lineage.percentage.toFixed(1)}%</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                )
              })
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
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          <span>Has lineage details</span>
        </div>
      </div>
    </div>
  )
}
