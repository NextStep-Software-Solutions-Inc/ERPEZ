import { useState, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Target, TrendingUp } from 'lucide-react'

interface KPITargetsDialogProps {
  open: boolean
  kpiName: string
  fiscalYear: number
  annualTarget: number | null
  existingQuarterlyTargets?: Record<string, number>
  isEditing?: boolean
  onClose: () => void
  onSave: (quarterlyTargets: Record<string, number>) => void
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export function KPITargetsDialog({
  open,
  kpiName,
  fiscalYear,
  annualTarget,
  existingQuarterlyTargets = {},
  isEditing = false,
  onClose,
  onSave
}: KPITargetsDialogProps) {
  const [quarterlyTargets, setQuarterlyTargets] = useState<Record<string, number | null>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize quarterly targets from existing or create empty
    const initialized: Record<string, number | null> = {}
    QUARTERS.forEach(quarter => {
      initialized[quarter] = existingQuarterlyTargets[quarter] || null
    })
    setQuarterlyTargets(initialized)
    setError(null)
  }, [open, existingQuarterlyTargets])

  const handleQuarterChange = (quarter: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && isNaN(numValue)) return

    // Validate against annual target if it exists
    if (annualTarget && annualTarget > 0 && numValue !== null && numValue > annualTarget) {
      setError(`${quarter} target (${numValue}) cannot exceed annual target (${annualTarget})`)
      return
    }

    setQuarterlyTargets(prev => ({
      ...prev,
      [quarter]: numValue
    }))
    setError(null)
  }

  const handleAutoDistribute = () => {
    if (!annualTarget || annualTarget <= 0) {
      setError('Annual target must be greater than 0 to distribute')
      return
    }

    const quarterValue = annualTarget / 4
    const distributed: Record<string, number> = {}
    QUARTERS.forEach(quarter => {
      distributed[quarter] = quarterValue
    })

    setQuarterlyTargets(distributed)
    setError(null)
  }

  const calculateTotal = (): number => {
    return QUARTERS.reduce((sum, quarter) => {
      const value = quarterlyTargets[quarter]
      return sum + (value !== null ? value : 0)
    }, 0)
  }

  const getVarianceMessage = (): string | null => {
    if (!annualTarget || annualTarget === 0) return null

    const total = calculateTotal()
    const variance = total - annualTarget
    const variancePercent = ((variance / annualTarget) * 100).toFixed(1)

    if (variance === 0) {
      return `✓ Quarterly targets match annual target (${total.toFixed(2)})`
    } else if (variance > 0) {
      return `⚠ Quarterly total exceeds annual target by ${variance.toFixed(2)} (+${variancePercent}%)`
    } else {
      return `ℹ Quarterly total is ${Math.abs(variance).toFixed(2)} below annual target (${variancePercent}%)`
    }
  }

  const hasAllValues = QUARTERS.every(quarter => quarterlyTargets[quarter] !== null)

  const handleSave = () => {
    // Validate that at least one quarterly target is set
    const hasAnyValue = QUARTERS.some(quarter => quarterlyTargets[quarter] !== null)
    if (!hasAnyValue) {
      setError('Please enter at least one quarterly target')
      return
    }

    // If annual target exists, check quarterly total doesn't exceed it
    if (annualTarget && annualTarget > 0) {
      const total = calculateTotal()
      if (total > annualTarget) {
        setError(`Quarterly total (${total.toFixed(2)}) cannot exceed annual target (${annualTarget.toFixed(2)})`)
        return
      }
    }

    // Convert null values to 0 or keep as is for proposal
    const targetData: Record<string, number> = {}
    QUARTERS.forEach(quarter => {
      targetData[quarter] = quarterlyTargets[quarter] ?? 0
    })

    onSave(targetData)
    onClose()
  }

  const isProposal = !annualTarget || annualTarget === 0

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onClose}
      title={`${isEditing ? 'Edit' : 'Set'} Quarterly Targets for ${kpiName}`}
      description="Configure quarterly targets for this KPI"
      size="lg"
      showCloseButton={true}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update' : 'Set'} Targets
          </Button>
        </div>
      }
      className="max-w-2xl"
    >
      <div className="space-y-6">
          {/* KPI Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600">KPI Name</Label>
                <p className="font-medium text-gray-900">{kpiName}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Fiscal Year</Label>
                <p className="font-medium text-gray-900">{fiscalYear}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Annual Target</Label>
                <p className="font-medium text-gray-900">
                  {calculateTotal() || (annualTarget !== null && annualTarget !== 0 ? annualTarget : 'Not Set')}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Info */}
          {isProposal ? (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                No annual target provided. You can propose quarterly targets for this KPI.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Annual target is set. Distribute it across quarters or set custom values.
              </AlertDescription>
            </Alert>
          )}

          {/* Quarterly Targets Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Quarterly Targets</Label>
              {!isProposal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoDistribute}
                  className="text-xs"
                >
                  Auto Distribute
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {QUARTERS.map(quarter => (
                <div key={quarter} className="space-y-2">
                  <Label htmlFor={`${quarter}-input`} className="text-sm font-medium text-gray-700">
                    {quarter} Target
                  </Label>
                  <Input
                    id={`${quarter}-input`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={isProposal ? 'Propose value' : 'Enter value'}
                    value={quarterlyTargets[quarter] === null ? '' : quarterlyTargets[quarter]}
                    onChange={(e) => handleQuarterChange(quarter, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quarterly Total:</span>
              <span className="text-lg font-bold text-gray-900">{calculateTotal().toFixed(2)}</span>
            </div>
            {annualTarget && annualTarget > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Annual Target:</span>
                <span className="text-lg font-bold text-gray-900">{annualTarget.toFixed(2)}</span>
              </div>
            )}
            {getVarianceMessage() && (
              <div className={`text-sm p-2 rounded ${
                calculateTotal() === annualTarget
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {getVarianceMessage()}
              </div>
            )}
          </div>

          {/* Completion Indicator */}
          {!isProposal && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${hasAllValues ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-700">
                {hasAllValues
                  ? '✓ All quarters configured'
                  : `${QUARTERS.filter(q => quarterlyTargets[q] !== null).length} of 4 quarters configured`}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </div>
    </ResponsiveDialog>
  )
}
