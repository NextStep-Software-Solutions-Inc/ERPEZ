import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProcurementPolicyConfigTableRow } from './ProcurementPolicyConfigTableRow'
import type {
  ProcurementPolicyConfig,
  ProcurementMode,
  ProcurementModeThreshold,
} from '@/lib/fiscal-year-and-policies/types'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'
import type { InlineEditValues } from '../hooks/useTableEditState'

type SortKey = 'modeName' | 'minAmount' | 'maxAmount' | 'fiscalYear'
type SortDir = 'asc' | 'desc'

interface ProcurementPolicyConfigTableProps {
  configs: ProcurementPolicyConfig[]
  modes: ProcurementMode[]
  thresholds: ProcurementModeThreshold[]
  fiscalYears: FiscalYear[]
  isLoading?: boolean
  isSaving?: boolean
  currentPage: number
  pageSize: number
  totalPages: number
  editingId: string | null
  editValues: InlineEditValues
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (config: ProcurementPolicyConfig) => void
  onDelete: (config: ProcurementPolicyConfig) => void
  onSave: (configId: string) => void
  onCancelEdit: () => void
  onUpdateEditValue: <K extends keyof InlineEditValues>(
    field: K,
    value: InlineEditValues[K],
  ) => void
  onBulkDelete: (ids: string[]) => void
}

function SortIcon({
  column,
  sortKey,
  direction,
}: {
  column: string
  sortKey: SortKey
  direction: SortDir
}) {
  if (sortKey !== column)
    return <ChevronsUpDown className="h-3 w-3 ml-1 text-muted-foreground" />
  return direction === 'asc' ? (
    <ChevronUp className="h-3 w-3 ml-1 text-foreground" />
  ) : (
    <ChevronDown className="h-3 w-3 ml-1 text-foreground" />
  )
}

export function ProcurementPolicyConfigTable({
  configs,
  modes,
  thresholds,
  fiscalYears,
  isLoading = false,
  isSaving = false,
  currentPage,
  pageSize,
  totalPages,
  editingId,
  editValues,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onUpdateEditValue,
  onBulkDelete,
}: ProcurementPolicyConfigTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('modeName')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const getModeById = (id: string) => modes.find((m) => m.id === id)
  const getThresholdById = (id: string) => thresholds.find((t) => t.id === id)
  const getFiscalYearLabel = (fyId: string) => {
    const fy = fiscalYears.find((f) => f.id === fyId)
    return fy ? `FY ${fy.year}` : 'N/A'
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedConfigs = useMemo(() => {
    return [...configs].sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'modeName': {
          const mA = getModeById(a.procurementModeId)?.name ?? ''
          const mB = getModeById(b.procurementModeId)?.name ?? ''
          comparison = mA.localeCompare(mB)
          break
        }
        case 'minAmount':
          comparison = a.minAmount - b.minAmount
          break
        case 'maxAmount':
          comparison = (a.maxAmount ?? Infinity) - (b.maxAmount ?? Infinity)
          break
        case 'fiscalYear': {
          const fyA =
            fiscalYears.find((f) => f.id === a.fiscalYearId)?.year ?? 0
          const fyB =
            fiscalYears.find((f) => f.id === b.fiscalYearId)?.year ?? 0
          comparison = fyA - fyB
          break
        }
      }
      return sortDir === 'asc' ? comparison : -comparison
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs, sortKey, sortDir, modes, fiscalYears])

  const allSelected =
    configs.length > 0 && configs.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(configs.map((c) => c.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const handleBulkDelete = () => {
    onBulkDelete([...selectedIds])
    setSelectedIds(new Set())
  }

  const thHead =
    'text-xs font-semibold text-muted-foreground uppercase tracking-wider'
  const thSortable = cn(
    thHead,
    'cursor-pointer select-none hover:text-foreground transition-colors',
  )

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} config{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 gap-1.5 text-xs ml-auto"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setSelectedIds(new Set())}
          >
            Deselect all
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    disabled={isLoading || configs.length === 0}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead
                  className={thSortable}
                  onClick={() => handleSort('modeName')}
                >
                  <div className="flex items-center">
                    Procurement Mode
                    <SortIcon
                      column="modeName"
                      sortKey={sortKey}
                      direction={sortDir}
                    />
                  </div>
                </TableHead>
                <TableHead className={thHead}>Threshold Range</TableHead>
                <TableHead
                  className={cn(thSortable, 'min-w-[200px]')}
                  onClick={() => handleSort('minAmount')}
                >
                  <div className="flex items-center">
                    Amount Range
                    <SortIcon
                      column="minAmount"
                      sortKey={sortKey}
                      direction={sortDir}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className={thSortable}
                  onClick={() => handleSort('fiscalYear')}
                >
                  <div className="flex items-center">
                    Fiscal Year
                    <SortIcon
                      column="fiscalYear"
                      sortKey={sortKey}
                      direction={sortDir}
                    />
                  </div>
                </TableHead>
                <TableHead className={cn(thHead, 'text-right')}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="py-3">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                      No procurement policy configurations found
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Try adjusting the filters or create a new configuration
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedConfigs.map((config) => (
                  <ProcurementPolicyConfigTableRow
                    key={config.id}
                    config={config}
                    mode={getModeById(config.procurementModeId)}
                    threshold={getThresholdById(
                      config.procurementModeThresholdId,
                    )}
                    fiscalYearLabel={getFiscalYearLabel(config.fiscalYearId)}
                    isEditing={editingId === config.id}
                    editValues={editValues}
                    isSaving={isSaving}
                    isSelected={selectedIds.has(config.id)}
                    onToggleSelect={toggleOne}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSave={onSave}
                    onCancel={onCancelEdit}
                    onUpdateEditValue={onUpdateEditValue}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(parseInt(v))}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
