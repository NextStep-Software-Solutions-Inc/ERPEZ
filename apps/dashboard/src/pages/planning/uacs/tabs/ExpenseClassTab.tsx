import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { TemplateTable } from '@/components/TemplateTable'
import { AddExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/AddExpenseClassDialog'
import { UpdateExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/UpdateExpenseClassDialog'
import { DeleteExpenseClassDialog } from '@/features/uacs/code-segments/dialogs/DeleteExpenseClassDialog'
import { createExpenseClassColumns } from '@/features/uacs/code-segments/tables/ExpenseClassColumns'
import ExpenseClassToolbar from '@/features/uacs/code-segments/tables/ExpenseClassToolbar'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { ExpenseClass } from '@/features/uacs/code-segments/types/expenseClassTypes'
import type { MetaActions } from '@/types/global'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getExpenseClassesRequest } from '@/features/uacs/code-segments/handlers/getExpenseClassesRequest'

const useExpenseClasses = createQueryHookFromTemplate(getExpenseClassesRequest)

export function ExpenseClassTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpenseClass | undefined>()
  const [deletingItem, setDeletingItem] = useState<ExpenseClass | undefined>()
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  // Build Sieve filter string for server-side search
  const sieveFilters = useMemo(() => {
    if (!search.trim()) return undefined
    return `Name@=*${search.trim()}|Code@=*${search.trim()}`
  }, [search])

  // Fetch expense classes from API with server-side pagination & search
  const { data: apiResponse, isLoading, error } = useExpenseClasses({
    pathParams: {},
    queryParams: {
      pageNumber: page,
      pageSize: pageSize,
      ...(sieveFilters ? { filters: sieveFilters } : {}),
    },
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const filteredData = useMemo(() => {
    const list = apiResponse?.data || []
    return list.filter((item) => {
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [apiResponse, showInactive])

  const columns = useMemo(
    () =>
      createExpenseClassColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading expense classes...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">Error loading expense classes</div>
        </CardContent>
      </Card>
    )
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
            manualPagination={true}
            pageCount={apiResponse?.totalPages || 1}
            pageIndex={page - 1}
            pageSize={pageSize}
            totalCount={apiResponse?.totalCount || 0}
            onPaginationChange={({ pageIndex, pageSize: newPageSize }) => {
              setPage(pageIndex + 1)
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize)
              }
            }}
            toolbar={(table) => (
              <ExpenseClassToolbar
                table={table}
                showColumnVisibility={true}
                onAdd={() => setAddDialogOpen(true)}
                addLabel="Add Expense Class"
                onSearch={handleSearch}
                searchValue={search}
              />
            )}
          />
        </CardContent>
      </Card>

      <AddExpenseClassDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <UpdateExpenseClassDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        expenseClass={editingItem}
      />

      <DeleteExpenseClassDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        expenseClass={deletingItem}
      />
    </>
  )
}

