import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { TemplateTable } from '@/components/TemplateTable'
import { AddExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/AddExpenseClassDialog'
import { UpdateExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/UpdateExpenseClassDialog'
import { DeleteExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/DeleteExpenseClassDialog'
import { createExpenseClassColumns } from '@/features/uacs/code-segments/tables/ExpenseClassColumns'
import ExpenseClassToolbar from '@/features/uacs/code-segments/tables/ExpenseClassToolbar'
import { fiscalYearAtom } from '@/features/uacs/code-segments/atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { ExpenseClass } from '@/features/uacs/code-segments/types/expenseClassTypes'
import type { MetaActions } from '@/types/global'

// Mock data
const mockExpenseClasses: ExpenseClass[] = [
  // 2025 Expense Classes (carry-forward base)
  {
    id: '2025-1',
    code: 'PS',
    name: 'Personnel Services',
    description: 'Salaries and wages for employees',
    type: 1,
    isActive: true,
    fiscalYear: 2025,
  },
  {
    id: '2025-2',
    code: 'MOOE',
    name: 'Maintenance & Other Operating Expenses',
    description: 'Operations and maintenance costs',
    type: 2,
    isActive: true,
    fiscalYear: 2025,
  },
  {
    id: '2025-3',
    code: 'CO',
    name: 'Capital Outlay',
    description: 'Equipment and infrastructure investment',
    type: 3,
    isActive: true,
    fiscalYear: 2025,
  },
  {
    id: '2025-4',
    code: 'FE',
    name: 'Financial Expenditure',
    description: 'Loans and financial assistance',
    type: 4,
    isActive: true,
    fiscalYear: 2025,
  },
  // 2026 Expense Classes (carry-forward from 2025)
  {
    id: '1',
    code: 'PS',
    name: 'Personnel Services',
    description: 'Salaries and wages for employees',
    type: 1,
    isActive: true,
    fiscalYear: 2026,
  },
  {
    id: '2',
    code: 'MOOE',
    name: 'Maintenance & Other Operating Expenses',
    description: 'Operations and maintenance costs',
    type: 2,
    isActive: true,
    fiscalYear: 2026,
  },
  {
    id: '3',
    code: 'CO',
    name: 'Capital Outlay',
    description: 'Equipment and infrastructure investment',
    type: 3,
    isActive: true,
    fiscalYear: 2026,
  },
  {
    id: '4',
    code: 'FE',
    name: 'Financial Expenditure',
    description: 'Loans and financial assistance',
    type: 4,
    isActive: true,
    fiscalYear: 2026,
  },
]

export function ExpenseClassTab() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpenseClass | undefined>()
  const [deletingItem, setDeletingItem] = useState<ExpenseClass | undefined>()
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  const filteredData = useMemo(() => {
    return mockExpenseClasses.filter((item) => {
      if ((item.fiscalYear ?? 0) !== selectedFY) return false
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [selectedFY, showInactive])

  const columns = useMemo(
    () =>
      createExpenseClassColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  const handleAddExpenseClass = async (data: any) => {
    // Mock submission
    console.log('Adding expense class:', data)
    setAddDialogOpen(false)
  }

  const handleUpdateExpenseClass = async (data: any) => {
    // Mock submission
    console.log('Updating expense class:', data)
    setEditingItem(undefined)
  }

  const handleDeleteExpenseClass = async () => {
    // Mock deletion
    console.log('Deleting expense class:', deletingItem)
    setDeletingItem(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Classes</CardTitle>
              <CardDescription>
                Manage expense classes (PS, MOOE, CO, FE) for budget categorization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateTable<ExpenseClass>
            columns={columns}
            data={filteredData}
            actions={actions}
            readonly={false}
            fixedPageSize={10}
            toolbar={(table) => (
              <ExpenseClassToolbar
                table={table}
                showColumnVisibility={true}
                onAdd={() => setAddDialogOpen(true)}
                addLabel="Add Expense Class"
              />
            )}
          />
        </CardContent>
      </Card>

      <AddExpenseClassDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddExpenseClass}
      />

      <UpdateExpenseClassDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        expenseClass={editingItem}
        onSuccess={handleUpdateExpenseClass}
      />

      <DeleteExpenseClassDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        expenseClass={deletingItem}
        onConfirm={handleDeleteExpenseClass}
      />
    </>
  )
}
