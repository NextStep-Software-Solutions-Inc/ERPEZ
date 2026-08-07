import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getModeColor } from '@/lib/fiscal-year-and-policies/utils/getModeColor'
import { AmountRangeProgress } from './AmountRangeProgress'
import type {
  ProcurementPolicyConfig,
  ProcurementMode,
  ProcurementModeThreshold,
} from '@/lib/fiscal-year-and-policies/types'
import type { InlineEditValues } from '../hooks/useTableEditState'

interface ProcurementPolicyConfigTableRowProps {
  config: ProcurementPolicyConfig
  mode: ProcurementMode | undefined
  threshold: ProcurementModeThreshold | undefined
  fiscalYearLabel: string
  isEditing: boolean
  editValues: InlineEditValues
  isSaving?: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (config: ProcurementPolicyConfig) => void
  onDelete: (config: ProcurementPolicyConfig) => void
  onSave: (configId: string) => void
  onCancel: () => void
  onUpdateEditValue: <K extends keyof InlineEditValues>(
    field: K,
    value: InlineEditValues[K],
  ) => void
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null) {
    return 'N/A'
  }
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ProcurementPolicyConfigTableRow({
  config,
  mode,
  threshold,
  fiscalYearLabel,
  isEditing,
  editValues,
  isSaving = false,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onUpdateEditValue,
}: ProcurementPolicyConfigTableRowProps) {
  const colors = getModeColor(mode?.name)

  const thresholdLabel = threshold
    ? `${formatPHP(threshold.minThreshold)} — ${threshold.maxThreshold ? formatPHP(threshold.maxThreshold) : '∞'}`
    : 'N/A'

  // Validate inline edit values
  const hasEditErrors =
    editValues.minAmount < 0 ||
    (editValues.maxAmount !== undefined &&
      editValues.maxAmount < editValues.minAmount)

  if (isEditing) {
    const sliderMin = Math.min(
      Math.max(0, threshold?.minThreshold ?? 0),
      editValues.minAmount,
    )
    const sliderBaseMax =
      threshold?.maxThreshold ??
      Math.max(editValues.maxAmount ?? editValues.minAmount, sliderMin + 1)
    const sliderMax = Math.max(sliderBaseMax, sliderMin + 1)
    const sliderRange = Math.max(0, sliderMax - sliderMin)
    const sliderStep =
      sliderRange <= 1 ? 0.01 : Math.max(0.01, Math.round(sliderRange / 100))
    const sliderMaxHandle = editValues.maxAmount ?? sliderMax
    const sliderValues: [number, number] = [
      editValues.minAmount,
      sliderMaxHandle,
    ]
    const roundToTwo = (value: number) => Math.round(value * 100) / 100
    const handleSliderChange = (values: number[]) => {
      const [newMin, newMax] = values
      if (typeof newMin === 'number') {
        onUpdateEditValue('minAmount', roundToTwo(newMin))
      }
      if (typeof newMax === 'number') {
        onUpdateEditValue('maxAmount', roundToTwo(newMax))
      }
    }
    const thresholdOverlayStart = clampValue(
      threshold?.minThreshold ?? sliderMin,
      sliderMin,
      sliderMax,
    )
    const thresholdOverlayEnd = clampValue(
      threshold?.maxThreshold ?? sliderMax,
      thresholdOverlayStart,
      sliderMax,
    )
    const thresholdLeftPct =
      sliderRange > 0
        ? ((thresholdOverlayStart - sliderMin) / sliderRange) * 100
        : 0
    const thresholdRightPct =
      sliderRange > 0
        ? ((thresholdOverlayEnd - sliderMin) / sliderRange) * 100
        : 100
    const rawThresholdWidth = Math.max(0, thresholdRightPct - thresholdLeftPct)
    const availableWidth = Math.max(0, 100 - thresholdLeftPct)
    const thresholdOverlayWidth = Math.min(
      availableWidth,
      Math.max(rawThresholdWidth, 4),
    )
    return (
      <TableRow className="bg-muted/30 border-l-2 border-l-primary">
        {/* Checkbox */}
        <TableCell className="w-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(config.id)}
            disabled={isSaving}
          />
        </TableCell>

        {/* Mode (read-only in edit mode) */}
        <TableCell>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              colors.badge,
            )}
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)}
            />
            {mode?.name ?? 'N/A'}
          </span>
        </TableCell>

        {/* Threshold (read-only in edit) */}
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {thresholdLabel}
          </span>
        </TableCell>

        {/* Amount Range — editable */}
        <TableCell className="min-w-60">
          <div className="space-y-2">
            {/* Input Fields */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  ₱
                </span>
                <Input
                  type="number"
                  value={editValues.minAmount}
                  onChange={(e) =>
                    onUpdateEditValue(
                      'minAmount',
                      e.target.value ? parseFloat(e.target.value) : 0,
                    )
                  }
                  disabled={isSaving}
                  step={0.01}
                  min={0}
                  placeholder="Min"
                  className={cn(
                    'h-8 pl-6 text-sm',
                    editValues.minAmount < 0 && 'border-destructive',
                  )}
                />
              </div>
              <span className="text-muted-foreground text-xs shrink-0">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  ₱
                </span>
                <Input
                  type="number"
                  value={editValues.maxAmount ?? ''}
                  onChange={(e) =>
                    onUpdateEditValue(
                      'maxAmount',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  disabled={isSaving}
                  step={0.01}
                  min={0}
                  placeholder="No limit"
                  className={cn(
                    'h-8 pl-6 text-sm',
                    editValues.maxAmount !== undefined &&
                      editValues.maxAmount < editValues.minAmount &&
                      'border-destructive',
                  )}
                />
              </div>
            </div>

            {/* Slider with Threshold Visualization */}
            <div className="relative rounded-lg border border-border bg-muted/50 p-2.5">
              <div className="pointer-events-none absolute inset-0 flex items-center px-2.5">
                <div className="relative h-1.5 w-full rounded-full bg-default-200">
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/30 transition-all duration-300"
                    style={{
                      left: `${thresholdLeftPct}%`,
                      width: `${thresholdOverlayWidth}%`,
                    }}
                  />
                </div>
              </div>
              <div className="relative z-10">
                <Slider
                  value={sliderValues}
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  showTooltip
                  color="primary"
                  radius="xl"
                  size="md"
                  className="w-full"
                  onValueChange={handleSliderChange}
                />
              </div>
            </div>

            {/* Visual Indicator */}
            <AmountRangeProgress
              minAmount={editValues.minAmount}
              maxAmount={editValues.maxAmount}
              thresholdMin={threshold?.minThreshold}
              thresholdMax={threshold?.maxThreshold}
              modeBarColorClass={colors.bar}
              thresholdLabel={thresholdLabel}
            />

            {/* Error Message */}
            {hasEditErrors && (
              <p className="text-xs text-destructive">
                Maximum amount must be greater than or equal to minimum amount.
              </p>
            )}
          </div>
        </TableCell>

        {/* Fiscal Year (read-only in edit mode) */}
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {fiscalYearLabel}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              color="primary"
              className="h-7 gap-1.5 text-xs"
              onClick={() => onSave(config.id)}
              disabled={isSaving || hasEditErrors}
            >
              <Check className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  // ─── View Mode ────────────────────────────────────────────────────────────
  return (
    <TableRow className="group hover:bg-muted/40 transition-colors">
      {/* Checkbox */}
      <TableCell className="w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(config.id)}
        />
      </TableCell>

      {/* Mode */}
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            colors.badge,
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)}
          />
          {mode?.name ?? 'N/A'}
        </span>
      </TableCell>

      {/* Threshold */}
      <TableCell>
        <span className="text-sm text-foreground">{thresholdLabel}</span>
      </TableCell>

      {/* Amount Range */}
      <TableCell className="min-w-[200px]">
        <AmountRangeProgress
          minAmount={config.minAmount}
          maxAmount={config.maxAmount}
          thresholdMin={threshold?.minThreshold}
          thresholdMax={threshold?.maxThreshold}
          modeBarColorClass={colors.bar}
          thresholdLabel={thresholdLabel}
        />
      </TableCell>

      {/* Fiscal Year */}
      <TableCell>
        <Badge variant="outline" className="text-xs font-medium">
          {fiscalYearLabel}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(config)}
            title="Edit config"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(config)}
            title="Delete config"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
