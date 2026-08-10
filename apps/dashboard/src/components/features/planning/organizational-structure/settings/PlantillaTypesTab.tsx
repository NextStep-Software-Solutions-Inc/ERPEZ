import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { usePlantillaTypes } from '@/pages/planning/organization/hooks/useSettings'
import { createPlantillaTypeColumns } from '@/components/features/planning/organizational-structure/table'
import { PlantillaTypeDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { PlantillaTypeSetting } from '@/components/features/planning/organizational-structure/types'

export function PlantillaTypesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlantillaTypeSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<PlantillaTypeSetting | null>(null)

  const { data: response } = usePlantillaTypes({ pathParams: {}, queryParams: {} })
  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createPlantillaTypeColumns({
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="plantilla-types" className="space-y-4">
      <TemplateTable<PlantillaTypeSetting>
        title="Plantilla Type Settings"
        description="Define plantilla types and classifications"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search plantilla types..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <PlantillaTypeDialogs
        createOpen={createDialogOpen}
        onCreateOpenChange={setCreateDialogOpen}
        editingItem={editingItem}
        onEditingItemChange={setEditingItem}
        deleteItem={deleteItem}
        onDeleteItemChange={setDeleteItem}
      />
    </TabsContent>
  )
}
