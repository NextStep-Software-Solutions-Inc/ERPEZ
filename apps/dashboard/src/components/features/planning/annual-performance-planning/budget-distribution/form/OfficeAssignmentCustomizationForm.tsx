/**
 * Office Assignment Customization Form
 * Step 3.3: Office customizes and submits their KPI targets
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, Info, Plus } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import { useOfficeAssignmentColumns, OfficeAssignmentToolbar } from '../table'
import { OfficeAssignmentEditDialog, OfficeAssignmentDeleteDialog } from '../dialogs'
import { MOCK_OFFICE_ASSIGNMENTS, MOCK_CURRENT_OFFICE } from '../mocks'
import type { OfficeAssignment } from '../mocks'

interface OfficeAssignmentCustomizationFormProps {
  budgetAllocations?: Array<{
    officeId: string
    officeName: string
    kpiId: string
    kpiCode: string
    kpiName: string
    allocatedBudget: number
  }>
  onComplete: (assignments: OfficeAssignment[]) => void
  onCancel?: () => void
}

export function OfficeAssignmentCustomizationForm({
  onComplete,
  onCancel,
}: OfficeAssignmentCustomizationFormProps) {
  const [assignments, setAssignments] = useState<OfficeAssignment[]>(MOCK_OFFICE_ASSIGNMENTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'submitted' | 'approved'>('all')
  const [editedFilter, setEditedFilter] = useState<'all' | 'edited' | 'unchanged'>('all')
  const [editingAssignment, setEditingAssignment] = useState<OfficeAssignment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean
    assignmentId?: string
    kpiName?: string
  }>({ open: false })

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.kpiCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.kpiName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus

      let matchesEdited = true
      if (editedFilter === 'edited') {
        matchesEdited = assignment.isEdited
      } else if (editedFilter === 'unchanged') {
        matchesEdited = !assignment.isEdited
      }

      return matchesSearch && matchesStatus && matchesEdited
    })
  }, [assignments, searchTerm, selectedStatus, editedFilter])

  const columns = useOfficeAssignmentColumns({
    onEditAssignment: (assignment: OfficeAssignment) => {
      setEditingAssignment(assignment)
      setIsEditDialogOpen(true)
    },
    onDeleteAssignment: (assignmentId: string, kpiName: string) => {
      setRemoveDialog({
        open: true,
        assignmentId,
        kpiName,
      })
    },
  })

  const handleSaveAssignment = (updated: OfficeAssignment) => {
    setAssignments(
      assignments.map((a) => (a.id === updated.id ? updated : a))
    )
    setIsEditDialogOpen(false)
    setEditingAssignment(null)
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter((a) => a.id !== assignmentId))
  }

  const fromPlanningCount = assignments.filter((a) => a.isFromPlanning).length
  const editedCount = assignments.filter((a) => a.isEdited).length
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length

  const canSubmit = assignments.some((a) => a.officeTarget !== null && a.officeTarget > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">Office Assignment Customization</h2>
            <p className="text-sm text-blue-700 mt-1">
              Office: <span className="font-medium">{MOCK_CURRENT_OFFICE.name}</span>
            </p>
          </div>
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
            <Plus className="h-4 w-4 mr-2" />
            Add New KPI
          </Button>
        </div>
        <p className="text-sm text-blue-700">
          Review targets from planning and customize them as needed. Edit targets that aren't locked,
          and add new KPIs that planning didn't include.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
          <div className="text-xs text-blue-700">Total Assignments</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{fromPlanningCount}</div>
          <div className="text-xs text-green-700">From Planning</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{editedCount}</div>
          <div className="text-xs text-orange-700">Edited</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{submittedCount}</div>
          <div className="text-xs text-purple-700">Submitted</div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <OfficeAssignmentToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          editedFilter={editedFilter}
          onEditedFilterChange={setEditedFilter}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <TemplateTable
          columns={columns}
          data={filteredAssignments}
          actions={['write', 'delete']}
        />
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Office Assignment Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Review all targets set by planning</li>
              <li>Adjust targets if needed based on your office capacity</li>
              <li>Add additional KPIs that planning didn't include</li>
              <li>Distribute targets across quarters (Q1-Q4) as needed</li>
              <li>Submit when all targets are finalized</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={() => onComplete(assignments)}
          disabled={!canSubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span>Submit Office Assignments</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Dialogs */}
      <OfficeAssignmentEditDialog
        open={isEditDialogOpen}
        assignment={editingAssignment}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveAssignment}
      />

      <OfficeAssignmentDeleteDialog
        open={removeDialog.open}
        assignmentId={removeDialog.assignmentId}
        kpiName={removeDialog.kpiName}
        onOpenChange={(open: boolean) => setRemoveDialog({ ...removeDialog, open })}
        onConfirm={handleRemoveAssignment}
      />
    </div>
  )
}
