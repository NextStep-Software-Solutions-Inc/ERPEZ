import { useEffect, useRef, useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { pascalCaseToWords } from '@/utils/formatters'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgetCallsRequest } from '@/lib/fiscal-year-and-policies/requests/getBudgetCallsRequest'
import { deleteBudgetCallRequest } from '@/lib/fiscal-year-and-policies/requests/deleteBudgetCallRequest'
import {
  ReusableFiscalYearSelector,
  type ReusableFiscalYearSelectorRef,
} from '../../fiscal-year-management/components/ReusableFiscalYearSelector'
import { BudgetCallForm } from './BudgetCallForm'
import { BudgetCallCard } from './BudgetCallCard'
import type { BudgetCall } from '@/lib/fiscal-year-and-policies/types'
import type { FiscalYear } from '../../fiscal-year-management/types/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Query hooks
const useBudgetCalls = createQueryHookFromTemplate(getBudgetCallsRequest)

export function BudgetCallSection() {
  // Use fiscal year selector component
  const selectorRef = useRef<ReusableFiscalYearSelectorRef>(null)
  const queryClient = useQueryClient()

  const [budgetCalls, setBudgetCalls] = useState<Array<BudgetCall>>([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedBudgetCall, setSelectedBudgetCall] = useState<
    BudgetCall | undefined
  >()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetCallToDelete, setBudgetCallToDelete] =
    useState<BudgetCall | null>(null)
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('')

  // Fetch budget calls
  const { data: budgetCallsData } = useBudgetCalls({
    pathParams: {},
    queryParams: {
      filters:
        selectedFiscalYearId && selectedFiscalYearId !== 'all'
          ? `fiscalYearId==${selectedFiscalYearId}`
          : undefined,
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (budgetCallId: string) => {
      const result = await deleteBudgetCallRequest.fetcher({
        finalUrl: deleteBudgetCallRequest.endpoint.replace(':id', budgetCallId),
      })
      return result
    },
    onSuccess: () => {
      toast.success('Budget call deleted successfully')
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/budget-calls')
        },
      })
      setDeleteDialogOpen(false)
      setBudgetCallToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to delete budget call')
    },
  })

  // Set budget calls from data
  useEffect(() => {
    const calls = budgetCallsData?.data || []
    setBudgetCalls(calls)
  }, [budgetCallsData])

  const activeFiscalYear = selectorRef.current?.selectedFiscalYear ?? null

  // Filter budget calls based on selected fiscal year
  const displayedBudgetCalls =
    selectedFiscalYearId === 'all'
      ? budgetCalls
      : activeFiscalYear
        ? budgetCalls.filter(
            (call) => call.fiscalYearId === activeFiscalYear.id,
          )
        : []

  // Handle fiscal year change
  const handleFiscalYearChange = (
    _fiscalYear: FiscalYear | null,
    fiscalYearId: string,
  ) => {
    setSelectedFiscalYearId(fiscalYearId)
    setFormOpen(false)
    setSelectedBudgetCall(undefined)
  }

  // Handle delete click
  const handleDeleteClick = (budgetCall: BudgetCall) => {
    setBudgetCallToDelete(budgetCall)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!budgetCallToDelete) return
    deleteMutation.mutate(budgetCallToDelete.id)
  }

  // Handle create new budget call
  const handleCreateNew = () => {
    setSelectedBudgetCall(undefined)
    setFormOpen(true)
  }

  // Handle edit budget call
  const handleEditCall = (call: BudgetCall) => {
    setSelectedBudgetCall(call)
    setFormOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Budget Calls
            </CardTitle>
            <CardDescription>
              {selectedFiscalYearId === 'all'
                ? 'All budget calls across fiscal years'
                : activeFiscalYear
                  ? `Budget calls for FY ${activeFiscalYear.year}`
                  : 'Select a fiscal year to view budget calls'}
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Budget Call
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fiscal Year Selector */}
          <ReusableFiscalYearSelector
            ref={selectorRef}
            onFiscalYearChange={handleFiscalYearChange}
            label="Fiscal Year"
            showAllOption={true}
            autoSelectFirst
          />
          {/* Empty State */}
          {displayedBudgetCalls.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-foreground">
                {selectedFiscalYearId === 'all'
                  ? 'No budget calls found'
                  : activeFiscalYear
                    ? `No budget calls for FY ${activeFiscalYear.year}`
                    : 'No fiscal year selected'}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {selectedFiscalYearId === 'all'
                  ? 'Create your first budget call to get started'
                  : activeFiscalYear
                    ? `Create a new budget call for this fiscal year to begin the submission process`
                    : 'Select a fiscal year above to view and manage budget calls'}
              </p>
              {activeFiscalYear && (
                <Button onClick={handleCreateNew} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget Call
                </Button>
              )}
            </div>
          )}

          {/* Budget Calls Grid */}
          {displayedBudgetCalls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBudgetCalls.map((call) => (
                <BudgetCallCard
                  key={call.id}
                  budgetCall={call}
                  onEdit={handleEditCall}
                  onDelete={handleDeleteClick}
                  showFiscalYear={selectedFiscalYearId === 'all'}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Call Form Dialog */}
      <BudgetCallForm
        open={formOpen}
        onOpenChange={setFormOpen}
        budgetCall={selectedBudgetCall}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget Call</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget call for{' '}
              {pascalCaseToWords(budgetCallToDelete?.type)}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Deadline: </span>
              {budgetCallToDelete
                ? new Date(
                    budgetCallToDelete.submissionDeadline,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
