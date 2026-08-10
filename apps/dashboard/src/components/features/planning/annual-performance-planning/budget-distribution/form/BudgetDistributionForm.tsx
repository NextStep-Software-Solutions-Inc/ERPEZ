/**
 * Budget Distribution Form
 * Step 3.2: Distribute base KPI targets to offices
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, Info } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import { useBudgetDistributionColumns } from '../table'
import { BudgetDistributionToolbar } from '../table/BudgetDistributionToolbar'
import { BudgetAllocationDialog } from '../dialog/BudgetAllocationDialog'
import { BudgetDistributionDeleteDialog } from '../dialog/BudgetDistributionDeleteDialog'
import { MOCK_BUDGET_ALLOCATIONS } from '../mocks'
import type { BudgetAllocation } from '../mocks'
export type { BudgetAllocation } from '../mocks'

interface BudgetDistributionFormProps {
  baseTargets?: Array<{
    kpiId: string
    kpiCode: string
    kpiName: string
    baseTargetValue: number
  }>
  onComplete: (allocations: BudgetAllocation[]) => void
  onCancel?: () => void
}

export function BudgetDistributionForm({
  onComplete,
  onCancel,
}: BudgetDistributionFormProps) {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>(MOCK_BUDGET_ALLOCATIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOffice, setSelectedOffice] = useState<string | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'allocated' | 'approved'>('all')
  const [editingAllocation, setEditingAllocation] = useState<BudgetAllocation | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    allocationId?: string
    officeName?: string
  }>({ open: false })

  const filteredAllocations = useMemo(() => {
    return allocations.filter((allocation) => {
      const matchesSearch =
        allocation.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.kpiCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.kpiName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesOffice = selectedOffice === 'all' || allocation.officeId === selectedOffice
      const matchesStatus = selectedStatus === 'all' || allocation.status === selectedStatus

      return matchesSearch && matchesOffice && matchesStatus
    })
  }, [allocations, searchTerm, selectedOffice, selectedStatus])

  const columns = useBudgetDistributionColumns({
    onEditAllocation: (allocation: BudgetAllocation) => {
      setEditingAllocation(allocation)
      setIsEditDialogOpen(true)
    },
    onDeleteAllocation: (allocationId: string, officeName: string) => {
      setDeleteDialog({
        open: true,
        allocationId,
        officeName,
      })
    },
  })

  const handleSaveAllocation = (updated: BudgetAllocation) => {
    setAllocations(
      allocations.map((a) => (a.id === updated.id ? updated : a))
    )
    setIsEditDialogOpen(false)
    setEditingAllocation(null)
  }

  const handleDeleteAllocation = (allocationId: string) => {
    setAllocations(allocations.filter((a) => a.id !== allocationId))
  }

  const totalAllocated = filteredAllocations.reduce(
    (sum, a) => sum + (a.allocatedBudget || 0),
    0
  )

  const allocationsWithValues = allocations.filter((a) => a.allocatedBudget > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Distribute Budgets to Offices</h2>
        <p className="text-sm text-blue-700">
          Allocate the base KPI targets to offices. Edit allocations, adjust quarterly distributions,
          and lock finalized budgets.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{allocations.length}</div>
          <div className="text-xs text-blue-700">Total Allocations</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{allocationsWithValues.length}</div>
          <div className="text-xs text-green-700">With Budget Set</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{totalAllocated.toFixed(2)}</div>
          <div className="text-xs text-purple-700">Total Allocated</div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <BudgetDistributionToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedOffice={selectedOffice}
          onOfficeChange={setSelectedOffice}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <TemplateTable
          columns={columns}
          data={filteredAllocations}
          actions={['write', 'delete']}
        />
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Budget Distribution Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Edit allocation amounts and quarterly distributions for each office</li>
              <li>Lock allocations to protect them from further changes</li>
              <li>Locked allocations cannot be edited - unlock them first if changes are needed</li>
              <li>Use filters and search to find specific offices or KPIs quickly</li>
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
          onClick={() => onComplete(allocationsWithValues)}
          disabled={allocationsWithValues.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span>Complete Budget Distribution</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Dialogs */}
      <BudgetAllocationDialog
        open={isEditDialogOpen}
        allocation={editingAllocation}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveAllocation}
      />

      <BudgetDistributionDeleteDialog
        open={deleteDialog.open}
        allocationId={deleteDialog.allocationId}
        officeName={deleteDialog.officeName}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteAllocation}
      />
    </div>
  )
}
