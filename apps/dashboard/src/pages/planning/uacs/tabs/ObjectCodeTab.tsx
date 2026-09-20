import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GitBranch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateTable } from '@/components/TemplateTable'
import { AddObjectCodeDialog } from '@/features/uacs/code-segments/dialogs/AddObjectCodeDialog'
import { UpdateObjectCodeDialog } from '@/features/uacs/code-segments/dialogs/UpdateObjectCodeDialog'
import { DeleteObjectCodeDialog } from '@/features/uacs/code-segments/dialogs/DeleteObjectCodeDialog'
import { ObjectCodeHierarchyViewer } from '@/features/uacs/code-segments/components/ObjectCodeHierarchyViewer'
import { createObjectCodeColumns } from '@/features/uacs/code-segments/tables/Columns'
import CodeSegmentToolbar from '@/features/uacs/code-segments/tables/CodeSegmentToolbar'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { fiscalYearAtom } from '@/features/uacs/code-segments/atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import { ExpenseClass } from '@/features/uacs/code-segments/types/commonTypes'
import type { ObjectCode } from '@/features/uacs/code-segments/types/objectCodeTypes'
import type { MetaActions } from '@/types/global'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getObjectCodesRequest } from '@/features/uacs/code-segments/handlers/getObjectCodesRequest'
import { getExpenseClassesRequest } from '@/features/uacs/code-segments/handlers/getExpenseClassesRequest'
import { autoTagExpenseClass } from '@/features/uacs/rules/utils/autoTaggingRules'

const useObjectCodes = createQueryHookFromTemplate(getObjectCodesRequest)
const useExpenseClasses = createQueryHookFromTemplate(getExpenseClassesRequest)

export function ObjectCodeTab() {
  const [activeTab, setActiveTab] = useState<'table' | 'hierarchy'>('table')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ObjectCode | undefined>()
  const [deletingItem, setDeletingItem] = useState<ObjectCode | undefined>()
  const [selectedParent, setSelectedParent] = useState<ObjectCode | undefined>()
  const [hierarchySearch, setHierarchySearch] = useState('')
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  // Sieve filter for server-side search
  const sieveFilters = useMemo(() => {
    if (!search.trim()) return undefined
    return `Name@=*${search.trim()}|Code@=*${search.trim()}`
  }, [search])

  // Fetch object codes from API (for hierarchy view fetch more items to show relationships)
  const queryPageSize = activeTab === 'hierarchy' ? 100 : pageSize
  const { data: apiResponse, isLoading, error } = useObjectCodes({
    pathParams: {},
    queryParams: {
      pageNumber: activeTab === 'hierarchy' ? 1 : page,
      pageSize: queryPageSize,
      ...(sieveFilters ? { filters: sieveFilters } : {}),
    },
  })

  // Fetch expense classes to map IDs to ExpenseClass enum for display
  const { data: expenseClassesResponse } = useExpenseClasses({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const expenseClassLookup = useMemo(() => {
    const map = new Map<string, ExpenseClass>()
    const expenseClasses = expenseClassesResponse?.data || []
    for (const ec of expenseClasses) {
      if (ec.id && ec.code) {
        map.set(ec.id, ec.code.toUpperCase() as ExpenseClass)
      }
    }
    return map
  }, [expenseClassesResponse])

  // Map API response to frontend ObjectCode type
  const mappedData: ObjectCode[] = useMemo(() => {
    const rawList = apiResponse?.data || []
    return rawList.map((raw) => {
      const lookupClass = raw.expenseClassId ? expenseClassLookup.get(raw.expenseClassId) : undefined
      const expenseClass = lookupClass || autoTagExpenseClass(raw.code) || ExpenseClass.PS

      return {
        id: raw.id,
        code: raw.code,
        name: raw.name,
        description: '',
        isActive: raw.isActive,
        fiscalYear: selectedFY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expenseClass,
        expenseClassId: raw.expenseClassId,
        parentId: raw.parent?.id,
        isSubsidiary: !!raw.parent,
      }
    })
  }, [apiResponse, expenseClassLookup, selectedFY])

  const filteredData = useMemo(() => {
    return mappedData.filter((item) => {
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [mappedData, showInactive])

  const columns = useMemo(
    () =>
      createObjectCodeColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleAddChild = (parentItem: ObjectCode) => {
    setSelectedParent(parentItem)
    setAddDialogOpen(true)
  }

  if (isLoading && !apiResponse) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading object codes...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">Error loading object codes</div>
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
              <CardTitle>Object Codes</CardTitle>
              <CardDescription>
                Manage object codes (10 digits) with expense class mapping (PS, MOOE, CO, FE)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'table' | 'hierarchy')}
            className="w-full"
          >
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="hierarchy">
                <GitBranch className="mr-2 h-4 w-4" />
                Hierarchy View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <TemplateTable<ObjectCode>
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
                    searchPlaceholder="Search Object Code..."
                    searchColumn="name"
                    onAdd={() => setAddDialogOpen(true)}
                    addLabel="Add Object Code"
                    onSearch={handleSearch}
                    searchValue={search}
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4">
              <div className="flex flex-col gap-4 w-full mb-4">
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                  <div className="flex flex-row space-x-2 flex-1 min-w-0">
                    <Input
                      placeholder="Search Object Code Hierarchy..."
                      value={(hierarchySearch as string) || ''}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHierarchySearch(event.target.value)}
                      className="flex-1 min-w-0 max-w-sm"
                    />
                    {(hierarchySearch as string) && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setHierarchySearch('')}
                        className="h-10 flex-shrink-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <ObjectCodeHierarchyViewer
                items={filteredData.filter((item) => 
                  !hierarchySearch || 
                  item.name.toLowerCase().includes((hierarchySearch as string).toLowerCase()) ||
                  item.code.includes(hierarchySearch as string)
                )}
                onEdit={setEditingItem}
                onDelete={setDeletingItem}
                onAddChild={handleAddChild}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddObjectCodeDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) setSelectedParent(undefined)
        }}
        parentItem={selectedParent}
        allObjectCodes={filteredData}
      />
      <UpdateObjectCodeDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        objectCode={editingItem}
      />
      <DeleteObjectCodeDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        objectCode={deletingItem}
      />
    </>
  )
}

