/**
 * Generic Target Row Component
 * 
 * Reusable row for target matrix in Phase 3
 * Handles all styling, interactions, and state for a single KPI target
 */

import { useState, useCallback } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Trash2,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AggregationType,
  calculateAnnual,
  distributeAnnualToQuarters,
  validateQuarterlyAgainstAnnual,
  getAggregationLabel,
  formatValue,
} from '../shared/utils/calculations'

// ============================================================================
// Types
// ============================================================================

export type SourceType = 'Mandated' | 'Negotiable' | 'Shopped'
export type NegotiationStatus = 'Draft' | 'Proposed' | 'Negotiating' | 'Agreed'

export interface TargetRowProps {
  rowId: string
  kpiName: string
  aggregationType: AggregationType
  sourceType: SourceType
  isLocked: boolean
  annualTarget: number
  q1: number
  q2: number
  q3: number
  q4: number
  negotiationStatus?: NegotiationStatus
  onValueChange?: (field: 'annual' | 'q1' | 'q2' | 'q3' | 'q4', value: number) => void
  onDelete?: () => void
  onComment?: () => void
  onStatusChange?: (status: NegotiationStatus) => void
  canEdit?: boolean
  isDirty?: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function TargetRow({
  rowId,
  kpiName,
  aggregationType,
  sourceType,
  isLocked,
  annualTarget,
  q1,
  q2,
  q3,
  q4,
  negotiationStatus = 'Draft',
  onValueChange,
  onDelete,
  onComment,
  onStatusChange,
  canEdit = true,
  isDirty = false,
}: TargetRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null)

  // Determine row styling based on source type
  const rowClass = cn(
    'border-b transition-colors hover:bg-gray-50',
    sourceType === 'Mandated' && 'bg-blue-50',
    sourceType === 'Negotiable' && 'bg-white',
    sourceType === 'Shopped' && 'bg-green-50',
    isDirty && 'ring-1 ring-amber-400',
  )

  const cellClass = 'px-2 py-2'

  // Calculate annual from quarters if changed
  const calculatedAnnual = calculateAnnual(aggregationType, q1, q2, q3, q4)
  const validation = validateQuarterlyAgainstAnnual(
    annualTarget,
    aggregationType,
    q1,
    q2,
    q3,
    q4,
  )

  // Determine if annual target cell should show warning
  const annualCellClass = cn(
    cellClass,
    'font-semibold text-center',
    !validation.isValid && 'bg-amber-100 border border-amber-300',
  )

  // Auto-spread handler
  const handleAutoSpread = useCallback(() => {
    const spread = distributeAnnualToQuarters(aggregationType, annualTarget)
    onValueChange?.('q1', spread.q1)
    onValueChange?.('q2', spread.q2)
    onValueChange?.('q3', spread.q3)
    onValueChange?.('q4', spread.q4)
  }, [annualTarget, aggregationType, onValueChange])

  // Cell input handler
  const handleCellChange = useCallback(
    (field: 'annual' | 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        onValueChange?.(field, parsed)
      }
    },
    [onValueChange],
  )

  // Determine which fields are editable
  const annualEditable =
    sourceType === 'Negotiable' && !isLocked && canEdit
  const quarterlyEditable = !isLocked && canEdit

  const EditableCell = ({
    field,
    value,
    disabled,
  }: {
    field: 'annual' | 'q1' | 'q2' | 'q3' | 'q4'
    value: number
    disabled?: boolean
  }) => (
    <TableCell className={cellClass}>
      {disabled ? (
        <div className="text-center text-gray-500 font-medium">
          {formatValue(value)}
        </div>
      ) : (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleCellChange(field, e.target.value)}
          onFocus={() => setEditingField(field)}
          onBlur={() => setEditingField(null)}
          className={cn(
            'text-center h-8 text-sm',
            editingField === field && 'ring-2 ring-primary',
          )}
          disabled={!quarterlyEditable}
        />
      )}
    </TableCell>
  )

  return (
    <TableRow className={rowClass}>
      {/* Source Type Badge */}
      <TableCell className={cellClass}>
        <Badge
          color={
            sourceType === 'Mandated'
              ? 'default'
              : sourceType === 'Negotiable'
                ? 'secondary'
                : 'default'
          }
          variant={
            sourceType !== 'Mandated' && sourceType !== 'Negotiable'
              ? 'outline'
              : undefined
          }
        >
          {sourceType}
        </Badge>
      </TableCell>

      {/* KPI Name */}
      <TableCell className={cn(cellClass, 'font-medium')}>
        {kpiName}
        {isLocked && <Lock className="inline w-3 h-3 ml-2 text-gray-400" />}
      </TableCell>

      {/* Aggregation Type */}
      <TableCell className={cellClass}>
        <div className="flex items-center gap-1">
          <span className="text-lg">{getAggregationLabel(aggregationType).symbol}</span>
          <span className="text-xs text-gray-600">
            {getAggregationLabel(aggregationType).label}
          </span>
        </div>
      </TableCell>

      {/* Annual Target (with auto-spread icon) */}
      <TableCell className={annualCellClass}>
        <div className="flex items-center justify-center gap-2">
          <EditableCell
            field="annual"
            value={annualTarget}
            disabled={!annualEditable}
          />
          {!isLocked && canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAutoSpread}
              title="Auto-spread to quarters"
              className="h-6 w-6 p-0"
            >
              <Zap className="w-4 h-4 text-amber-500" />
            </Button>
          )}
        </div>
      </TableCell>

      {/* Q1 */}
      <EditableCell field="q1" value={q1} />

      {/* Q2 */}
      <EditableCell field="q2" value={q2} />

      {/* Q3 */}
      <EditableCell field="q3" value={q3} />

      {/* Q4 */}
      <EditableCell field="q4" value={q4} />

      {/* Total (calculated) */}
      <TableCell className={cn(cellClass, 'font-semibold text-center')}>
        <div className="flex items-center justify-center gap-1">
          <span>{formatValue(calculatedAnnual)}</span>
          {!validation.isValid && (
            <AlertCircle className="w-4 h-4 text-amber-500" title={validation.warning || ''} />
          )}
        </div>
      </TableCell>

      {/* Negotiation Status (if Phase 3) */}
      {negotiationStatus && (
        <TableCell className={cellClass}>
          <Badge
            color={
              negotiationStatus === 'Agreed'
                ? 'default'
                : negotiationStatus === 'Negotiating'
                  ? 'secondary'
                  : 'default'
            }
            variant={
              negotiationStatus !== 'Agreed' && negotiationStatus !== 'Negotiating'
                ? 'outline'
                : undefined
            }
          >
            {negotiationStatus}
          </Badge>
        </TableCell>
      )}

      {/* Actions */}
      <TableCell className={cellClass}>
        <div className="flex gap-1">
          {/* Comment */}
          {onComment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onComment}
              title="Open comments"
              className="h-6 w-6 p-0"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}

          {/* Delete (only for Shopped) */}
          {sourceType === 'Shopped' && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Remove this KPI"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

// ============================================================================
// Lock Icon Component (inline)
// ============================================================================

function Lock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// ============================================================================
// Table Header Component (to accompany TargetRow)
// ============================================================================

export function TargetTableHeader() {
  return (
    <>
      <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Source</th>
      <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">KPI</th>
      <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Agg.</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Annual</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Q1</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Q2</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Q3</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Q4</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Total</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
      <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
    </>
  )
}
