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
import type { ObjectCode } from '@/features/uacs/code-segments/types/objectCodeTypes'
import type { MetaActions } from '@/types/global'
import { flattenedMockObjectCodes } from '@/features/uacs/utils/mockData'


export function ObjectCodeTab() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ObjectCode | undefined>()
  const [deletingItem, setDeletingItem] = useState<ObjectCode | undefined>()
  const [selectedParent, setSelectedParent] = useState<ObjectCode | undefined>()
  const [hierarchySearch, setHierarchySearch] = useState('')
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  const filteredData = useMemo(() => {
    return flattenedMockObjectCodes.filter((item) => {
      if (item.fiscalYear !== selectedFY) return false
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [selectedFY, showInactive])

  const columns = useMemo(
    () =>
      createObjectCodeColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  const handleAddChild = (parentItem: ObjectCode) => {
    setSelectedParent(parentItem)
    setAddDialogOpen(true)
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
          <Tabs defaultValue="table" className="w-full">
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
                data={filteredData.filter((item) => !item.parentId)}
                actions={actions}
                readonly={false}
                fixedPageSize={10}
                toolbar={(table) => (
                  <CodeSegmentToolbar
                    table={table}
                    searchPlaceholder="Search Object Code..."
                    searchColumn="name"
                    onAdd={() => setAddDialogOpen(true)}
                    addLabel="Add Object Code"
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
