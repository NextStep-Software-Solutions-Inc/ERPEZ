/**
 * Market Scoping Parameters Management Page
 * System administration interface for managing NGPA evaluation parameters
 * URL: /v2/market-scoping/manage/parameters
 * Pattern: TemplateTable with column factory, toolbar, and Jotai state
 */

import { useMemo, useState, useEffect } from 'react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateTable } from '@/components/TemplateTable'
import {
  parameterListFilterAtom,
  selectedParameterForEditAtom,
  parametersAtom,
} from '@/features/planning/market-scoping'
import { getParametersRequest } from '@/features/planning/market-scoping/handlers/getParametersRequest'
import type { ParameterDefinition } from '@/features/planning/market-scoping/types/managementTypes'
import {
  ManageParameterDialog,
  DeleteParameterDialog,
  selectedParameterForDeleteAtom,
} from '@/features/planning/market-scoping/dialogs'
import {
  createParametersTableColumns,
  ParametersTableToolbar,
} from '@/features/planning/market-scoping/tables'
import type { MetaActions } from '@/types/global'

const useParameters = createQueryHookFromTemplate(getParametersRequest)

export default function ManageParametersPage() {
  const [filter] = useAtom(parameterListFilterAtom)
  const parameters = useAtomValue(parametersAtom)
  const setParameters = useSetAtom(parametersAtom)
  const setSelectedForEdit = useSetAtom(selectedParameterForEditAtom)
  const setSelectedForDelete = useSetAtom(selectedParameterForDeleteAtom)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data } = useParameters({ pathParams: {}, queryParams: {} })
  const apiParameters = data?.data ?? []

  useEffect(() => {
    if (data) {
      setParameters(
        apiParameters.map((item) => ({
          id: item.id,
          type: item.name,
          displayName: item.name,
          guidedQuestion: item.guidedQuestion,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
          createdDate: new Date(),
        })),
      )
    }
  }, [data, apiParameters, setParameters])

  // Apply filters and sorting
  const filteredParameters = useMemo(() => {
    let rows = parameters

    // Filter by status
    if (filter.statusFilter !== 'all') {
      const isActive = filter.statusFilter === 'active'
      rows = rows.filter((p) => p.isActive === isActive)
    }

    // Filter by search term
    if (filter.searchTerm.trim()) {
      const q = filter.searchTerm.toLowerCase()
      rows = rows.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.guidedQuestion.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      )
    }

    // Sort by sortOrder
    return rows.sort((a, b) => a.sortOrder - b.sortOrder)
  }, [filter, parameters])

  const actions: MetaActions = ['write', 'delete']

  // Handle edit action from table
  const handleEdit = (parameter: ParameterDefinition) => {
    setSelectedForEdit(parameter)
    setIsEditDialogOpen(true)
  }

  // Handle delete action from table
  const handleDelete = (parameter: ParameterDefinition) => {
    setSelectedForDelete(parameter)
    setIsDeleteDialogOpen(true)
  }

  // Create columns using the factory function
  const columns = useMemo(
    () =>
      createParametersTableColumns({
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
              <CardTitle className="text-3xl">
                NGPA Evaluation Parameters
              </CardTitle>
              <CardDescription className="text-base">
                Manage the evaluation parameters used in market scoping
                assessments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold"
              >
                <span>{filteredParameters.length} Parameters</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <TemplateTable
          columns={columns}
          data={filteredParameters}
          actions={actions}
          readonly={false}
          toolbar={(table) => (
            <ParametersTableToolbar
              table={table}
              onCreateNew={handleCreateNew}
            />
          )}
        />
      </div>

      {/* Create Dialog */}
      <ManageParameterDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setSelectedForEdit(null)
          }
        }}
      />

      {/* Edit Dialog */}
      <ManageParameterDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setSelectedForEdit(null)
          }
        }}
      />

      {/* Delete Dialog */}
      <DeleteParameterDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  )
}
