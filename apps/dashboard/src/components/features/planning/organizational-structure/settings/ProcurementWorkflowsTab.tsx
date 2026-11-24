import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { useProcurementWorkflows } from '@/pages/planning/organization/hooks/useSettings'
import { createProcurementWorkflowColumns } from '@/components/features/planning/organizational-structure/settings/tables'
import { ProcurementWorkflowDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { ProcurementWorkflowSetting } from '@/components/features/planning/organizational-structure/types'

export function ProcurementWorkflowsTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProcurementWorkflowSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<ProcurementWorkflowSetting | null>(null)

  const { data: response } = useProcurementWorkflows({
    pathParams: {},
    queryParams: { pageSize: 1000, sorts: 'name' },
  })

  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createProcurementWorkflowColumns({
    actions,
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="procurement-workflows" className="space-y-4">
      <TemplateTable<ProcurementWorkflowSetting>
        title="Procurement Workflow Settings"
        description="Configure procurement workflow types and approval processes"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search workflows..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <ProcurementWorkflowDialogs
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
