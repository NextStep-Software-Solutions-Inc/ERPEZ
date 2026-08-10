/**
 * NonProcurableCostDetailForm
 * Modal form for editing non-procurable cost details including the new metadata fields
 * Sections: Basic Info, Allocations, MoP, Expected Delivery, Remarks, Attachments, NEW: Metadata
 */

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { NonProcurableCost, ProjectType } from '../types'
import {
  PPMP_FIELD_LABELS,
  PRE_PROCUREMENT_CONFERENCE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
} from '../lib/ppmpFieldDefaults'

interface NonProcurableCostDetailFormProps {
  cost: NonProcurableCost | null
  isOpen: boolean
  isSaving?: boolean
  onClose: () => void
  onSave: (updatedCost: NonProcurableCost) => void | Promise<void>
}

export function NonProcurableCostDetailForm({
  cost,
  isOpen,
  isSaving = false,
  onClose,
  onSave,
}: NonProcurableCostDetailFormProps) {
  const [formData, setFormData] = useState<NonProcurableCost | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen && cost) {
      setFormData({ ...cost })
      setHasChanges(false)
    }
  }, [isOpen, cost])

  const handleInputChange = (
    field: keyof NonProcurableCost,
    value: unknown,
  ) => {
    if (!formData) return
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!formData) return
    await onSave(formData)
    setHasChanges(false)
  }

  if (!formData) return null

  const projectTypeValue = (formData.projectType ?? 'unset') as
    | ProjectType
    | 'unset'
  const preProcValue = formData.preProcurementConference ?? 'N/A'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Non-Procurable Cost</DialogTitle>
          <DialogDescription>
            Update the cost item details and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Section 1: Basic Information */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Basic Information
            </h3>
            <div className="space-y-3 pl-7">
              {/* Cost Item Name */}
              <div>
                <Label htmlFor="costItemName" className="text-xs font-medium">
                  Cost Item Name
                </Label>
                <Input
                  id="costItemName"
                  value={formData.costItemName}
                  onChange={(e) =>
                    handleInputChange('costItemName', e.target.value)
                  }
                  placeholder="e.g., Office Furniture, Equipment, etc."
                  className="mt-1 text-sm"
                />
              </div>

              {/* Total Cost */}
              <div>
                <Label htmlFor="totalCost" className="text-xs font-medium">
                  Total Cost
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₱
                  </span>
                  <Input
                    id="totalCost"
                    type="number"
                    value={formData.totalCost}
                    onChange={(e) =>
                      handleInputChange('totalCost', Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="pl-7 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Section 2: Mode of Procurement */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Mode of Procurement
            </h3>
            <div className="space-y-2 pl-7">
              <Label htmlFor="mop" className="text-xs font-medium">
                Select Mode
              </Label>
              <Select
                value={formData.mop || ''}
                onValueChange={(value) => handleInputChange('mop', value)}
              >
                <SelectTrigger id="mop">
                  <SelectValue placeholder="Choose mode..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="request-for-quote">
                    Request for Quotation (RFQ)
                  </SelectItem>
                  <SelectItem value="direct-purchase">
                    Direct Purchase
                  </SelectItem>
                  <SelectItem value="in-house">In-House</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Section 3: Expected Delivery & Remarks */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-xs font-bold">
                3
              </span>
              Delivery & Remarks
            </h3>
            <div className="space-y-3 pl-7">
              {/* Expected Delivery */}
              <div>
                <Label
                  htmlFor="expectedDelivery"
                  className="text-xs font-medium"
                >
                  Expected Delivery Date / Quarter
                </Label>
                <Input
                  id="expectedDelivery"
                  value={formData.expectedDelivery || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'expectedDelivery',
                      e.target.value || null,
                    )
                  }
                  placeholder="e.g., Q2 2026, June 2026"
                  className="mt-1 text-sm"
                />
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks" className="text-xs font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks || ''}
                  onChange={(e) =>
                    handleInputChange('remarks', e.target.value || null)
                  }
                  placeholder="Additional notes or comments..."
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Section 4: NEW - Metadata Fields */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span className="text-blue-700 dark:text-blue-300">
                Project Metadata
              </span>
              <Badge variant="outline" className="text-xs ml-auto">
                NEW
              </Badge>
            </h3>

            <div className="space-y-3 pl-7 pt-3 border-t border-blue-200 dark:border-blue-900">
              {/* Project Type */}
              <div>
                <Label htmlFor="projectType" className="text-xs font-medium">
                  {PPMP_FIELD_LABELS.projectType}
                </Label>
                <Select
                  value={projectTypeValue}
                  onValueChange={(value) =>
                    handleInputChange(
                      'projectType',
                      value === 'unset' ? null : (value as ProjectType),
                    )
                  }
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select project type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unset">Not set</SelectItem>
                    {PROJECT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Size of the Project to be Procured */}
              <div>
                <Label
                  htmlFor="sizeSpecification"
                  className="text-xs font-medium"
                >
                  {PPMP_FIELD_LABELS.quantityAndSize}
                </Label>
                <Textarea
                  id="sizeSpecification"
                  value={formData.sizeSpecification || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'sizeSpecification',
                      e.target.value || null,
                    )
                  }
                  placeholder="e.g., 10 units desk (1.2m x 0.6m), 5 sets of ergonomic chairs"
                  rows={2}
                  className="mt-1 text-sm"
                />
              </div>

              {/* Pre-Procurement Conference */}
              <div>
                <Label
                  htmlFor="preProcConference"
                  className="text-xs font-medium"
                >
                  {PPMP_FIELD_LABELS.preProcurementConference}
                </Label>
                <Select
                  value={preProcValue}
                  onValueChange={(value) =>
                    handleInputChange(
                      'preProcurementConference',
                      value === 'N/A' ? null : value,
                    )
                  }
                >
                  <SelectTrigger id="preProcConference" className="mt-1">
                    <SelectValue placeholder="Select requirement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRE_PROCUREMENT_CONFERENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Procurement Timeline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="procurementStart"
                    className="text-xs font-medium"
                  >
                    {PPMP_FIELD_LABELS.procurementStart} (MM/YYYY)
                  </Label>
                  <Input
                    id="procurementStart"
                    value={formData.procurementStart || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'procurementStart',
                        e.target.value || null,
                      )
                    }
                    placeholder="Defaults to N/A"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="procurementEnd"
                    className="text-xs font-medium"
                  >
                    {PPMP_FIELD_LABELS.procurementEnd} (MM/YYYY)
                  </Label>
                  <Input
                    id="procurementEnd"
                    value={formData.procurementEnd || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'procurementEnd',
                        e.target.value || null,
                      )
                    }
                    placeholder="Defaults to N/A"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Market Scoping Information */}
              <div className="space-y-2">
                <div>
                  <Label
                    htmlFor="marketScopingId"
                    className="text-xs font-medium"
                  >
                    Market Scoping Form ID
                  </Label>
                  <Input
                    id="marketScopingId"
                    value={formData.marketScopingId || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'marketScopingId',
                        e.target.value || null,
                      )
                    }
                    placeholder="e.g., msf-2026-0001"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label
                    htmlFor="marketScopingRef"
                    className="text-xs font-medium"
                  >
                    {PPMP_FIELD_LABELS.marketScopingReference}
                  </Label>
                  <Input
                    id="marketScopingRef"
                    value={formData.marketScopingRef || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'marketScopingRef',
                        e.target.value || null,
                      )
                    }
                    placeholder="e.g., MSF-2026-0001-v2"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Market Scoping Cost Estimate */}
              <div>
                <Label
                  htmlFor="marketScopingCostEstimate"
                  className="text-xs font-medium"
                >
                  Market Scoping Cost Estimate
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₱
                  </span>
                  <Input
                    id="marketScopingCostEstimate"
                    type="number"
                    value={formData.marketScopingCostEstimate || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'marketScopingCostEstimate',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="0.00"
                    className="pl-7 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Form Status Alert */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {hasChanges && (
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-300 text-xs">
                You have unsaved changes. Click "Save" to apply them.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────────── */}
        {/* Dialog Footer */}
        {/* ───────────────────────────────────────────────────────────────────── */}
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
