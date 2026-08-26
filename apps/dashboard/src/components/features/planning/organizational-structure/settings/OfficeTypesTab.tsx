import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { createOfficeTypeColumns } from '@/components/features/planning/organizational-structure/table'
import { OfficeTypeDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { OfficeTypeEntity } from '@/components/features/planning/organizational-structure/types'
import { useOfficeTypes } from '@/pages/planning/organization/hooks/useSettings'

export function OfficeTypesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OfficeTypeEntity | null>(null)
  const [deleteItem, setDeleteItem] = useState<OfficeTypeEntity | null>(null)

  const { data: response } = useOfficeTypes({
    pathParams: {},
    queryParams: { pageSize: 1000, sorts: 'name' },
  })

  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createOfficeTypeColumns({
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="office-types" className="space-y-4">
      <TemplateTable<OfficeTypeEntity>
        title="Office Type Settings"
        description="Manage office types for your organizational structure"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search office types..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <OfficeTypeDialogs
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
