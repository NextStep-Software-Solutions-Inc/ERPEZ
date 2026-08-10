import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { createOfficeCategoryColumns } from '@/components/features/planning/organizational-structure/settings/tables'
import { OfficeCategoryDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { OfficeCategoryEntity } from '@/components/features/planning/organizational-structure/types'
import { useOfficeCategories } from '@/pages/planning/organization/hooks/useSettings'

export function OfficeCategoriesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OfficeCategoryEntity | null>(null)
  const [deleteItem, setDeleteItem] = useState<OfficeCategoryEntity | null>(null)

  const { data: response } = useOfficeCategories({
    pathParams: {},
    queryParams: {},
  })

  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createOfficeCategoryColumns({
    actions,
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="office-categories" className="space-y-4">
      <TemplateTable<OfficeCategoryEntity>
        title="Office Category Settings"
        description="Manage office categories for your organizational structure"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search office categories..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <OfficeCategoryDialogs
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
