import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { usePositionTypes } from '@/pages/planning/organization/hooks/useSettings'
import { createPositionTypeColumns } from '@/components/features/planning/organizational-structure/table'
import { PositionTypeDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { PositionTypeSetting } from '@/components/features/planning/organizational-structure/types'

export function PositionTypesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PositionTypeSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<PositionTypeSetting | null>(null)

  const { data: response } = usePositionTypes({ pathParams: {}, queryParams: {} })
  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createPositionTypeColumns({
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="position-types" className="space-y-4">
      <TemplateTable<PositionTypeSetting>
        title="Position Type Settings"
        description="Manage position types for your organization"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search position types..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <PositionTypeDialogs
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
