import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateTable } from '@/components/TemplateTable'
import { GitBranch } from 'lucide-react'
import { AddMfoPapDialog } from '@/features/uacs/code-segments/dialogs/AddMfoPapDialog'
import { UpdateMfoPapDialog } from '@/features/uacs/code-segments/dialogs/UpdateMfoPapDialog'
import { DeleteMfoPapDialog } from '@/features/uacs/code-segments/dialogs/DeleteMfoPapDialog'
import { MfoPapHierarchyViewer } from '@/features/uacs/code-segments/components/MfoPapHierarchyViewer'
import { createMfoPapColumns } from '@/features/uacs/code-segments/tables/Columns'
import CodeSegmentToolbar from '@/features/uacs/code-segments/tables/CodeSegmentToolbar'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { fiscalYearAtom } from '@/features/uacs/code-segments/atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { MfoPap } from '@/features/uacs/code-segments/types/mfoPapTypes'
import { MfoPapType } from '@/features/uacs/code-segments/types/commonTypes'
import type { MetaActions } from '@/types/global'

const MOCK_MFO_PAP_CODES: MfoPap[] = [
  {
    id: '1',
    code: '100000001',
    name: 'Education Services',
    description: 'Education Program',
    type: MfoPapType.PROGRAM,
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1-1',
    code: '100100001',
    name: 'Basic Education Activity',
    description: 'Basic Education Service Delivery',
    type: MfoPapType.ACTIVITY,
    parentId: '1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1-1-1',
    code: '100101001',
    name: 'Elementary School Construction',
    description: 'Construction of elementary school facilities',
    type: MfoPapType.PROJECT,
    parentId: '1-1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1-1-2',
    code: '100101002',
    name: 'Secondary School Construction',
    description: 'Construction of secondary school facilities',
    type: MfoPapType.PROJECT,
    parentId: '1-1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1-1-3',
    code: '100101003',
    name: 'Higher Education Facilities',
    description: 'Construction of higher education facilities',
    type: MfoPapType.PROJECT,
    parentId: '1-1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '1-2',
    code: '100200001',
    name: 'Higher Education Activity',
    description: 'Higher Education Service Delivery',
    type: MfoPapType.ACTIVITY,
    parentId: '1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '200000001',
    name: 'Health Services',
    description: 'Health Program',
    type: MfoPapType.PROGRAM,
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2-1',
    code: '200100001',
    name: 'Primary Health Care Activity',
    description: 'Primary Health Care Service Delivery',
    type: MfoPapType.ACTIVITY,
    parentId: '2',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2-1-1',
    code: '200101001',
    name: 'Clinic Construction',
    description: 'Construction of primary health care clinics',
    type: MfoPapType.PROJECT,
    parentId: '2-1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2-1-2',
    code: '200101002',
    name: 'Medical Equipment Procurement',
    description: 'Procurement of medical equipment',
    type: MfoPapType.PROJECT,
    parentId: '2-1',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: '300000001',
    name: 'Infrastructure Development',
    description: 'Infrastructure Program',
    type: MfoPapType.PROGRAM,
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3-1',
    code: '300100001',
    name: 'Road Network Expansion Activity',
    description: 'Road construction and maintenance',
    type: MfoPapType.ACTIVITY,
    parentId: '3',
    isActive: true,
    fiscalYear: 2026,
    prexcAligned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function MfoPapTab() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MfoPap | undefined>()
  const [deletingItem, setDeletingItem] = useState<MfoPap | undefined>()
  const [selectedParent, setSelectedParent] = useState<MfoPap | undefined>()
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  const filteredData = useMemo(() => {
    return MOCK_MFO_PAP_CODES.filter((item) => {
      if (item.fiscalYear !== selectedFY) return false
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [selectedFY, showInactive])

  const columns = useMemo(
    () =>
      createMfoPapColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  const handleAddChild = (parentItem: MfoPap) => {
    setSelectedParent(parentItem)
    setAddDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MFO/PAP Codes</CardTitle>
              <CardDescription>
                Manage Major Final Output / Programs, Activities, and Projects (9 digits - PREXC aligned)
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
              <TemplateTable<MfoPap>
                columns={columns}
                data={filteredData}
                actions={actions}
                readonly={false}
                fixedPageSize={10}
                toolbar={(table) => (
                  <CodeSegmentToolbar
                    table={table}
                    searchPlaceholder="Search MFO/PAP..."
                    searchColumn="name"
                    onAdd={() => setAddDialogOpen(true)}
                    addLabel="Add MFO/PAP"
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4">
              <MfoPapHierarchyViewer
                items={filteredData}
                onEdit={setEditingItem}
                onDelete={setDeletingItem}
                onAddChild={handleAddChild}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddMfoPapDialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) setSelectedParent(undefined)
        }}
        parentItem={selectedParent}
        allItems={filteredData}
      />
      <UpdateMfoPapDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        mfoPap={editingItem}
      />
      <DeleteMfoPapDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        mfoPap={deletingItem}
      />
    </>
  )
}
