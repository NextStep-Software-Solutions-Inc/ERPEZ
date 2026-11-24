import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import { AddFundingSourceDialog } from '@/features/uacs/code-segments/dialogs/AddFundingSourceDialog'
import { UpdateFundingSourceDialog } from '@/features/uacs/code-segments/dialogs/UpdateFundingSourceDialog'
import { DeleteFundingSourceDialog } from '@/features/uacs/code-segments/dialogs/DeleteFundingSourceDialog'
import { createFundingSourceColumns } from '@/features/uacs/code-segments/tables/Columns'
import CodeSegmentToolbar from '@/features/uacs/code-segments/tables/CodeSegmentToolbar'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { FundingSource } from '@/features/uacs/code-segments/types/fundingSourceTypes'
import type { MetaActions } from '@/types/global'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFundingSourcesRequest } from '@/features/uacs/code-segments/handlers/getFundingSourcesRequest'

// Create query hook from template
const useFundingSources = createQueryHookFromTemplate(getFundingSourcesRequest)

export function FundingSourceTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FundingSource | undefined>()
  const [deletingItem, setDeletingItem] = useState<FundingSource | undefined>()
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  // Build Sieve filter string for server-side search
  const sieveFilters = useMemo(() => {
    if (!search.trim()) return undefined
    // Sieve: Name@=*term means case-insensitive contains on Name OR Code
    return `Name@=*${search.trim()}|Code@=*${search.trim()}`
  }, [search])

  // Fetch funding sources from API with server-side search
  const { data: apiResponse, isLoading, error } = useFundingSources({
    pathParams: {},
    queryParams: {
      pageNumber: page,
      pageSize: pageSize,
      ...(sieveFilters ? { filters: sieveFilters } : {}),
    },
  })

  // Reset to page 1 when search changes (debounce fires in toolbar)
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  // Filter data based on fiscal year and inactive codes setting
  const filteredData = useMemo(() => {
    const sources = apiResponse?.data || []
    return sources.filter((item) => {
      if (!showInactive && !item.isActive) {
        return false
      }
      return true
    })
  }, [apiResponse, showInactive])

  const columns = useMemo(
    () =>
      createFundingSourceColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading funding sources...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">Error loading funding sources</div>
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
              <CardTitle>Funding Source Codes</CardTitle>
              <CardDescription>
                Manage funding source codes (6 digits) - e.g., General Fund, Special Fund
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateTable<FundingSource>
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
              <CodeSegmentToolbar
                table={table}
                searchPlaceholder="Search Funding Source..."
                searchColumn="code"
                onAdd={() => setAddDialogOpen(true)}
                addLabel="Add Funding Source"
                onSearch={handleSearch}
                searchValue={search}
              />
            )}
          />
        </CardContent>
      </Card>

      <AddFundingSourceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <UpdateFundingSourceDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        fundingSource={editingItem}
      />
      <DeleteFundingSourceDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        fundingSource={deletingItem}
      />
    </>
  )
}
