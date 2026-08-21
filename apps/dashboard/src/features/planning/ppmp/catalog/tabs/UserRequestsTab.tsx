/**
 * UserRequestsTab
 * User's submitted item requests with status filtering and quick creation
 * Status tabs: Draft, Submitted, Approved, Returned
 */

import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRequestsTable } from '../tables/UserRequestsTable'
import { UserRequestDetailPanel } from '../panels/UserRequestDetailPanel'
import { EditRequestItemDialog } from '../dialogs/EditRequestItemDialog'
import { RequestItemDialog } from '../dialogs/RequestItemDialog'
import { useUserRequests } from '../hooks/useRequestFilters'
import { requestItemDialogOpenAtom } from '../atoms/requestAtoms'
import type { ItemRequest } from '../types/catalog.types'

export function UserRequestsTab() {
  const [selectedStatus, setSelectedStatus] = useState<ItemRequest['status']>(
    'Submitted',
  )
  const setCreateDialogOpen = useSetAtom(requestItemDialogOpenAtom)

  const { requests: userRequests, total, isLoading } = useUserRequests()
  const draftRequests = userRequests.filter(
    (req: ItemRequest) => req.status === 'Draft',
  )
  const submittedRequests = userRequests.filter(
    (req: ItemRequest) => req.status === 'Submitted',
  )
  const approvedRequests = userRequests.filter(
    (req: ItemRequest) => req.status === 'Approved',
  )
  const returnedRequests = userRequests.filter(
    (req: ItemRequest) => req.status === 'Returned',
  )

  const statusMap: Record<ItemRequest['status'], ItemRequest[]> = {
    Draft: draftRequests,
    Submitted: submittedRequests,
    Approved: approvedRequests,
    Returned: returnedRequests,
  }

  const getTableData = (): ItemRequest[] => statusMap[selectedStatus] || []

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            My Item Requests
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total} total requests • {draftRequests.length} draft •{' '}
            {submittedRequests.length} submitted • {approvedRequests.length} approved
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 self-start sm:self-auto bg-primary hover:bg-primary/90 shadow-sm text-xs font-semibold"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Request New Item
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value as ItemRequest['status'])}
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-4 p-1 bg-muted/60">
          <TabsTrigger value="Draft" className="text-xs">
            Draft
            {draftRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                {draftRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Submitted" className="text-xs">
            Submitted
            {submittedRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-[10px] font-bold">
                {submittedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Approved" className="text-xs">
            Approved
            {approvedRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold">
                {approvedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Returned" className="text-xs">
            Returned
            {returnedRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 text-[10px] font-bold">
                {returnedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={selectedStatus} className="mt-0">
          <UserRequestsTable
            data={getTableData()}
            total={total}
            isLoading={isLoading}
            selectedStatus={selectedStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Panels and Dialogs */}
      <UserRequestDetailPanel />
      <EditRequestItemDialog />
      <RequestItemDialog />
    </div>
  )
}
