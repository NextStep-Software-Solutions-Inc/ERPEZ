/**
 * UserRequestsTab
 * User's submitted item requests with status filtering
 * Phase 1/2: Draft, Submitted, Approved, Returned tabs
 * Features: status filter tabs, request details, edit/delete
 */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRequestsTable } from '../tables/UserRequestsTable'
import { UserRequestDetailPanel } from '../panels/UserRequestDetailPanel'
import { ItemDetailReadOnlyPanel } from '../panels/ItemDetailReadOnlyPanel'
import { EditRequestItemDialog } from '../dialogs/EditRequestItemDialog'
import { useUserRequests } from '../hooks/useRequestFilters'
import type { ItemRequest } from '../types/catalog.types'

export function UserRequestsTab() {
  const [selectedStatus, setSelectedStatus] = useState<ItemRequest['status']>(
    'Submitted',
  )

  const { requests: userRequests, total } = useUserRequests()
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

  const getTableData = (): ItemRequest[] => statusMap[selectedStatus]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">My Item Requests</h2>
        <p className="text-sm text-muted-foreground">
          {total} total requests • {draftRequests.length} draft •{' '}
          {submittedRequests.length} submitted
        </p>
      </div>

      {/* Status Filter Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value as ItemRequest['status'])}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="Draft" className="relative">
            Draft
            {draftRequests.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                {draftRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Submitted" className="relative">
            Submitted
            {submittedRequests.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {submittedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Approved">
            Approved
            {approvedRequests.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                {approvedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Returned">
            Returned
            {returnedRequests.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                {returnedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={selectedStatus} className="space-y-4 mt-6">
          <UserRequestsTable
            data={getTableData()}
            total={total}
            isLoading={false}
            selectedStatus={selectedStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      {total === 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">
            No requests yet
          </p>
          <p className="text-xs text-muted-foreground">
            Go to the Browse Library tab to submit your first item request
          </p>
        </div>
      )}

      {/* Detail Panel & Dialogs */}
      <UserRequestDetailPanel />
      <ItemDetailReadOnlyPanel />
      <EditRequestItemDialog />
    </div>
  )
}
