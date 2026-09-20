import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ObjectCodeForm, type ObjectCodeFormValues } from '../forms/ObjectCodeForm'
import { ExpenseClass } from '../types/commonTypes'
import type { ObjectCode } from '../types/objectCodeTypes'
import { autoTagExpenseClass } from '../../rules/utils/autoTaggingRules'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createObjectCodeRequest } from '../handlers/createObjectCodeRequest'
import { getObjectCodesRequest } from '../handlers/getObjectCodesRequest'
import { getExpenseClassesRequest } from '../handlers/getExpenseClassesRequest'

const useCreateObjectCode = createMutationHookFromTemplate(createObjectCodeRequest)
const useExpenseClasses = createQueryHookFromTemplate(getExpenseClassesRequest)

interface AddObjectCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allObjectCodes?: ObjectCode[]
  parentItem?: ObjectCode
  onSuccess?: () => void
  onObjectCodeAdded?: (newCode: ObjectCode) => void
}

export function AddObjectCodeDialog({
  open,
  onOpenChange,
  allObjectCodes = [],
  parentItem,
  onSuccess,
  onObjectCodeAdded,
}: AddObjectCodeDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateObjectCode()

  // Fetch expense classes to resolve expenseClassId
  const { data: expenseClassesResponse } = useExpenseClasses({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const handleSubmit = async (data: ObjectCodeFormValues) => {
    try {
      // Determine expense class: auto-tag from code, inherit from parent, or default
      const autoTaggedClass = autoTagExpenseClass(data.code)
      const targetClass = autoTaggedClass || parentItem?.expenseClass || ExpenseClass.PS

      // Resolve expenseClassId from fetched expense classes
      const expenseClasses = expenseClassesResponse?.data || []
      const matchedExpenseClass = expenseClasses.find(
        (ec) =>
          ec.code?.toUpperCase() === targetClass ||
          ec.name?.toUpperCase().includes(targetClass)
      )

      const parentId = parentItem?.id || (data.parentId ? data.parentId : null)

      await mutateAsync({
        pathParams: {},
        payload: {
          code: data.code,
          name: data.name,
          isActive: data.isActive,
          parentId,
          expenseClassId: matchedExpenseClass ? matchedExpenseClass.id : null,
        },
      })

      toast.success(`Object Code "${data.name}" created successfully!`)

      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === getObjectCodesRequest.endpoint ||
          (typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith(getObjectCodesRequest.endpoint)),
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create object code.'
      toast.error(errorMessage)
      console.error(err)
    }
  }

  const dialogTitle = parentItem
    ? `Add Sub-Object Code (Parent: ${parentItem.code})`
    : 'Add Object Code'
  const dialogDescription = parentItem
    ? `Enter details for the new sub-object code under parent ${parentItem.code}. It will be marked as subsidiary and inherit expense class: ${parentItem.expenseClass}.`
    : 'Enter the details for the new object code. Expense class will be auto-tagged based on code prefix.'

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      size="sm"
      showCloseButton
    >
      <ObjectCodeForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isPending}
        parentItem={parentItem}
        allItems={allObjectCodes}
      />
    </ResponsiveDialog>
  )
}