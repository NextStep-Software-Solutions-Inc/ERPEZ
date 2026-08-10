/**
 * Office Assignment Edit Dialog
 * Dialog for editing office target assignments
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { OfficeAssignment } from '../mocks'

interface OfficeAssignmentEditDialogProps {
  open: boolean
  assignment?: OfficeAssignment | null
  onOpenChange: (open: boolean) => void
  onSave: (assignment: OfficeAssignment) => void
}

export function OfficeAssignmentEditDialog({
  open,
  assignment,
  onOpenChange,
  onSave,
}: OfficeAssignmentEditDialogProps) {
  const [formData, setFormData] = useState<Partial<OfficeAssignment>>(
    assignment || {
      officeTarget: 0,
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      notes: '',
    }
  )

  const handleSave = () => {
    if (assignment) {
      onSave({
        ...assignment,
        officeTarget: formData.officeTarget ?? assignment.allocationFromPlanning,
        q1: formData.q1 ?? null,
        q2: formData.q2 ?? null,
        q3: formData.q3 ?? null,
        q4: formData.q4 ?? null,
        notes: formData.notes || '',
        isEdited: true,
      })
      onOpenChange(false)
    }
  }

  const canEdit =
    !assignment?.isFromPlanning || assignment?.allocationFromPlanning === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Target Assignment</DialogTitle>
          <DialogDescription>
            {assignment?.kpiCode} - {assignment?.kpiName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Planning Allocation (Read-only) */}
          {assignment?.isFromPlanning && assignment?.allocationFromPlanning > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Planning Allocation</label>
              <Input
                type="number"
                value={assignment.allocationFromPlanning || ''}
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                This target was set by planning. You can modify it in your office target below.
              </p>
            </div>
          )}

          {/* Office Target */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Office Target
              {assignment?.isFromPlanning && assignment?.allocationFromPlanning > 0 && (
                <span className="text-gray-500 font-normal ml-2">(Optional Adjustment)</span>
              )}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.officeTarget ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  officeTarget: e.target.value === '' ? 0 : Number(e.target.value),
                })
              }
              disabled={!canEdit}
              className="mt-1"
              placeholder={
                assignment?.allocationFromPlanning
                  ? assignment.allocationFromPlanning.toFixed(2)
                  : '0.00'
              }
            />
          </div>

          {/* Quarterly Distribution */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Quarterly Distribution
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['q1', 'q2', 'q3', 'q4'].map((quarter) => (
                <div key={quarter}>
                  <label className="text-xs font-medium text-gray-600">{quarter.toUpperCase()}</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[quarter as 'q1' | 'q2' | 'q3' | 'q4'] ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [quarter]:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="mt-1 text-xs"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              placeholder="Add notes about this assignment..."
              rows={3}
            />
          </div>

          {!canEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                This KPI was set by planning. You can adjust the target, but not remove it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
