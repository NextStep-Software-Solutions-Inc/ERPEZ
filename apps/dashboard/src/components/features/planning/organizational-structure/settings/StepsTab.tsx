import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { useSteps } from '@/pages/planning/organization/hooks/useSettings'
import { createStepColumns } from '@/components/features/planning/organizational-structure/settings/tables'
import { StepDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { StepSetting } from '@/components/features/planning/organizational-structure/types'

export function StepsTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StepSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<StepSetting | null>(null)

  const { data: response } = useSteps({ pathParams: {}, queryParams: { pageSize: 1000, sorts: 'stepNumber' } })
  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createStepColumns({
    actions,
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="steps" className="space-y-4">
      <TemplateTable<StepSetting>
        title="Step Settings"
        description="Manage salary steps and increments"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search steps..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => {
              const selectedRows = table.getSelectedRowModel().flatRows
              const firstSelectedRow = selectedRows[0]

              if (firstSelectedRow) {
                setDeleteItem(firstSelectedRow.original as StepSetting)
              }
            }}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <StepDialogs
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
