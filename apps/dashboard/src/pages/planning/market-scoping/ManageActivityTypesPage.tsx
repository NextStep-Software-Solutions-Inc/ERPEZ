/**
 * Market Scoping Activity Types Management Page
 * System administration interface for managing market research activity types
 * URL: /v2/market-scoping/manage/activities
 * Pattern: TemplateTable with column factory, toolbar, and Jotai state
 */

import { useMemo, useState, useEffect } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateTable } from '@/components/TemplateTable'
import {
  activityTypeListFilterAtom,
  selectedActivityTypeForEditAtom,
  activityTypesAtom,
} from '@/features/planning/market-scoping'
import { getActivityTypesRequest } from '@/features/planning/market-scoping/handlers/getActivityTypesRequest'
import type { ActivityTypeDefinition } from '@/features/planning/market-scoping/types/managementTypes'
import {
  ManageActivityTypeDialog,
  DeleteActivityTypeDialog,
  selectedActivityTypeForDeleteAtom,
} from '@/features/planning/market-scoping/dialogs'
import {
  createActivityTypesTableColumns,
  ActivityTypesTableToolbar,
} from '@/features/planning/market-scoping/tables'
import type { MetaActions } from '@/types/global'

const useActivityTypes = createQueryHookFromTemplate(getActivityTypesRequest)

export default function ManageActivityTypesPage() {
  const [filter] = useAtom(activityTypeListFilterAtom)
  const activityTypes = useAtomValue(activityTypesAtom)
  const setActivityTypes = useSetAtom(activityTypesAtom)
  const setSelectedForEdit = useSetAtom(selectedActivityTypeForEditAtom)
  const setSelectedForDelete = useSetAtom(selectedActivityTypeForDeleteAtom)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data } = useActivityTypes({ pathParams: {}, queryParams: {} })
  const apiActivityTypes = data?.data ?? []

  useEffect(() => {
    if (data) {
      setActivityTypes(
        apiActivityTypes.map((item) => ({
          id: item.id,
          type: item.activityType,
          activityType: item.activityType,
          label: item.label,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          createdDate: new Date(),
        }))
      )
    }
  }, [data, apiActivityTypes, setActivityTypes])

  // Apply filters and sorting
  const filteredActivities = useMemo(() => {
    let rows = activityTypes

    // Filter by status
    if (filter.statusFilter !== 'all') {
      const isActive = filter.statusFilter === 'active'
      rows = rows.filter((a) => a.isActive === isActive)
    }

    // Filter by search term
    if (filter.searchTerm.trim()) {
      const q = filter.searchTerm.toLowerCase()
      rows = rows.filter(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q),
      )
    }

    // Sort by sortOrder
    return rows.sort((a, b) => a.sortOrder - b.sortOrder)
  }, [filter, activityTypes])

  const actions: MetaActions = ['write', 'delete']

  // Handle edit action from table
  const handleEdit = (activity: ActivityTypeDefinition) => {
    setSelectedForEdit(activity)
    setIsEditDialogOpen(true)
  }

  // Handle delete action from table
  const handleDelete = (activity: ActivityTypeDefinition) => {
    setSelectedForDelete(activity)
    setIsDeleteDialogOpen(true)
  }

  // Create columns using the factory function
  const columns = useMemo(
    () =>
      createActivityTypesTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [],
  )

  // Handle create action
  const handleCreateNew = () => {
    setSelectedForEdit(null)
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Market Research Activity Types</CardTitle>
              <CardDescription className="text-base">
                Manage the activity types available for market scoping forms
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <span>{filteredActivities.length} Types</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <TemplateTable
          columns={columns}
          data={filteredActivities}
          actions={actions}
          readonly={false}
          toolbar={(table) => (
            <ActivityTypesTableToolbar
              table={table}
              onCreateNew={handleCreateNew}
            />
          )}
        />
      </div>

      {/* Create Dialog */}
      <ManageActivityTypeDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setSelectedForEdit(null)
          }
        }}
      />

      {/* Edit Dialog */}
      <ManageActivityTypeDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedForEdit(null)
          }
        }}
      />

      {/* Delete Dialog */}
      <DeleteActivityTypeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  )
}

