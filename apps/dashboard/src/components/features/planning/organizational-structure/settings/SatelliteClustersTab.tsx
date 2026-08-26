import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { useSatelliteClusters } from '@/pages/planning/organization/hooks/useSettings'
import { createSatelliteClusterColumns } from '@/components/features/planning/organizational-structure/settings/tables'
import { SatelliteClusterDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { SatelliteClusterSetting } from '@/components/features/planning/organizational-structure/types'

export function SatelliteClustersTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SatelliteClusterSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<SatelliteClusterSetting | null>(null)

  const { data: response } = useSatelliteClusters({
    pathParams: {},
    queryParams: { pageSize: 1000, sorts: 'name' },
  })

  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createSatelliteClusterColumns({
    actions,
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="satellite-clusters" className="space-y-4">
      <TemplateTable<SatelliteClusterSetting>
        title="Satellite/Cluster Settings"
        description="Manage satellite offices and cluster organizations"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search clusters..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <SatelliteClusterDialogs
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
