import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import { AddLocationDialog } from '@/features/uacs/code-segments/dialogs/AddLocationDialog'
import { UpdateLocationDialog } from '@/features/uacs/code-segments/dialogs/UpdateLocationDialog'
import { DeleteLocationDialog } from '@/features/uacs/code-segments/dialogs/DeleteLocationDialog'
import { createLocationColumns } from '@/features/uacs/code-segments/tables/Columns'
import CodeSegmentToolbar from '@/features/uacs/code-segments/tables/CodeSegmentToolbar'
import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { fiscalYearAtom } from '@/features/uacs/code-segments/atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '@/features/uacs/code-segments/atoms/showInactiveCodesAtom'
import type { LocationCode } from '@/features/uacs/code-segments/types/locationCodeTypes'
import type { MetaActions } from '@/types/global'

const MOCK_LOCATION_CODES: LocationCode[] = [
  {
    id: '1',
    code: '001001001',
    name: 'Region I',
    description: 'Ilocos Region',
    isActive: true,
    fiscalYear: 2026,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '002002002',
    name: 'Region II',
    description: 'Cagayan Valley',
    isActive: true,
    fiscalYear: 2026,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function LocationTab() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LocationCode | undefined>()
  const [deletingItem, setDeletingItem] = useState<LocationCode | undefined>()
  const [selectedFY] = useAtom(fiscalYearAtom)
  const [showInactive] = useAtom(showInactiveCodesAtom)

  const actions: MetaActions = ['write', 'delete']

  const filteredData = useMemo(() => {
    return MOCK_LOCATION_CODES.filter((item) => {
      if (item.fiscalYear !== selectedFY) return false
      if (!showInactive && !item.isActive) return false
      return true
    })
  }, [selectedFY, showInactive])

  const columns = useMemo(
    () =>
      createLocationColumns({
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
              <CardTitle>Location Codes</CardTitle>
              <CardDescription>
                Manage location codes (9 digits) - regions, provinces, municipalities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateTable<LocationCode>
            columns={columns}
            data={filteredData}
            actions={actions}
            readonly={false}
            fixedPageSize={10}
            toolbar={(table) => (
              <CodeSegmentToolbar
                table={table}
                searchPlaceholder="Search Location..."
                searchColumn="name"
                onAdd={() => setAddDialogOpen(true)}
                addLabel="Add Location"
              />
            )}
          />
        </CardContent>
      </Card>

      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <UpdateLocationDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        locationCode={editingItem}
      />
      <DeleteLocationDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        locationCode={deletingItem}
      />
    </>
  )
}
