import { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import type { MetaActions } from '@/types/global'
import { useSalaryGrades } from '@/pages/planning/organization/hooks/useSettings'
import { createSalaryGradeColumns } from '@/components/features/planning/organizational-structure/table'
import { SalaryGradeDialogs } from '@/components/features/planning/organizational-structure/settings/dialogs'
import { SettingsTableToolbar } from '@/components/features/planning/organizational-structure/settings/tables/SettingsTableToolbar'
import { TemplateTable } from '@/components/TemplateTable'
import type { SalaryGradeSetting } from '@/components/features/planning/organizational-structure/types'

export function SalaryGradesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SalaryGradeSetting | null>(null)
  const [deleteItem, setDeleteItem] = useState<SalaryGradeSetting | null>(null)

  const { data: response } = useSalaryGrades({ pathParams: {}, queryParams: {} })
  const items = response?.data ?? []

  const actions: MetaActions = ['write', 'delete']
  const columns = createSalaryGradeColumns({
    onEdit: setEditingItem,
    onDelete: setDeleteItem,
  })

  return (
    <TabsContent value="salary-grades" className="space-y-4">
      <TemplateTable<SalaryGradeSetting>
        title="Salary Grade Settings"
        description="Configure salary grades and compensation ranges"
        columns={columns}
        data={items}
        actions={actions}
        readonly={false}
        toolbar={(table) => (
          <SettingsTableToolbar
            table={table}
            searchPlaceholder="Search salary grades..."
            onCreateClick={() => setCreateDialogOpen(true)}
            onDeleteClick={() => setDeleteItem(items[0])}
          />
        )}
        forTab
        fixedPageSize={10}
      />

      <SalaryGradeDialogs
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
