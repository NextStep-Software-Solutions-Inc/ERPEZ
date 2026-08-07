import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import { AddOrganizationDialog } from '@/features/uacs/code-segments/dialogs/AddOrganizationDialog'
import { UpdateOrganizationDialog } from '@/features/uacs/code-segments/dialogs/UpdateOrganizationDialog'
import { DeleteOrganizationDialog } from '@/features/uacs/code-segments/dialogs/DeleteOrganizationDialog'
import { createOrganizationColumns } from '@/features/uacs/code-segments/tables/Columns'
import CodeSegmentToolbar from '@/features/uacs/code-segments/tables/CodeSegmentToolbar'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { fiscalYearAtom } from '@/features/uacs/code-segments/atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { OrganizationCode } from '@/features/uacs/code-segments/types/organizationCodeTypes'
import type { MetaActions } from '@/types/global'

const MOCK_ORGANIZATION_CODES: OrganizationCode[] = [
  // 2025 Organization Codes (carry-forward base)
  {
    id: '2025-1',
    code: '010101010101',
    name: 'Department of Education',
    description: 'Department',
    isActive: true,
    fiscalYear: 2025,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 2026 Organization Codes (carry-forward from 2025)
  {
    id: '1',
    code: '010101010101',
    name: 'Department of Education',
    description: 'Department',
    isActive: true,
    fiscalYear: 2026,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '020202020202',
    name: 'Department of Health',
    description: 'Department',
    isActive: true,
    fiscalYear: 2026,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function OrganizationTab() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OrganizationCode | undefined>()
  const [deletingItem, setDeletingItem] = useState<OrganizationCode | undefined>()
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  const filteredData = useMemo(() => {
    return MOCK_ORGANIZATION_CODES.filter((item) => {
      if (item.fiscalYear !== selectedFY) return false
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [selectedFY, showInactive])

  const columns = useMemo(
    () =>
      createOrganizationColumns({
        onEdit: setEditingItem,
        onDelete: setDeletingItem,
      }),
    []
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Codes</CardTitle>
              <CardDescription>
                Manage organization codes (12 digits) - departments and units
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateTable<OrganizationCode>
            columns={columns}
            data={filteredData}
            actions={actions}
            readonly={false}
            fixedPageSize={10}
            toolbar={(table) => (
              <CodeSegmentToolbar
                table={table}
                searchPlaceholder="Search Organization..."
                searchColumn="name"
                onAdd={() => setAddDialogOpen(true)}
                addLabel="Add Organization"
              />
            )}
          />
        </CardContent>
      </Card>

      <AddOrganizationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <UpdateOrganizationDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        organizationCode={editingItem}
      />
      <DeleteOrganizationDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        organizationCode={deletingItem}
      />
    </>
  )
}
