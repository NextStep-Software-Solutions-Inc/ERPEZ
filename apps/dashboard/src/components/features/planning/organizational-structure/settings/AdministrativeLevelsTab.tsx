import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAdministrativeLevelsRequest } from '@/components/features/planning/organizational-structure/settings/handlers/administrative-level/getAdministrativeLevelsRequest'
import { createAdministrativeLevelColumns } from '@/components/features/planning/organizational-structure/settings/tables'
import { AdministrativeLevelDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'

const useAdministrativeLevels = createQueryHookFromTemplate(getAdministrativeLevelsRequest)

export function AdministrativeLevelsTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AdministrativeLevel | null>(null)
  const [deleteItem, setDeleteItem] = useState<AdministrativeLevel | null>(null)

  const { data: administrativeLevel } = useAdministrativeLevels({
    pathParams: {},
    queryParams: {},
  })
  const administrativeLevels = administrativeLevel?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createAdministrativeLevelColumns({
    actions,
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="admin-levels" className="space-y-4">
      <TemplateTable<AdministrativeLevel>
        title="Administrative Level Settings"
        description="Manage hierarchical levels in your organizational structure"
        columns={columns}
        data={administrativeLevels}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search administrative levels..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(administrativeLevels[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <AdministrativeLevelDialogs
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
