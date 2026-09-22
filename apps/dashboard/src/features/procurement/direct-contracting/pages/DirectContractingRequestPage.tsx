"use client"

import * as React from 'react'
import { Building, Plus } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

import { CreateDirectContractingModal } from '../components/CreateDirectContractingModal'
import { UpdateDirectContractingModal } from '../components/UpdateDirectContractingModal'
import { ViewProposalDetailsModal } from '../components/ViewProposalDetailsModal'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getDirectContractingsRequest } from '../handlers/getDirectContractingsRequest'

import {
  DirectContractingTable,
  INITIAL_MOCK_DATA,
  type DirectContractingRecord,
  type TableActionHandlers,
} from '../tables'

const useDirectContractings = createQueryHookFromTemplate(getDirectContractingsRequest)

export function DirectContractingRequestPage() {
  const { toast } = useToast()

  // Hybrid Data State: Initialized with rich mock items, seamlessly incorporates API items if returned
  const [data, setData] = React.useState<DirectContractingRecord[]>(INITIAL_MOCK_DATA)

  // API Query
  const { data: apiResponse } = useDirectContractings({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Synchronize with API response if present
  React.useEffect(() => {
    if (apiResponse?.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
      setData((prev) => {
        const apiIds = new Set(apiResponse.data.map((item: any) => item.id))
        const preservedMocks = prev.filter((p) => !apiIds.has(p.id))
        const formattedApi = apiResponse.data.map((item: any) => ({
          ...item,
          name: item.name || item.dcName,
          dcName: item.name || item.dcName,
          supplierName: item.exclusiveSupplierName || item.supplierName,
          exclusiveSupplierName: item.exclusiveSupplierName || item.supplierName,
          submissionDeadline: item.submissionDeadline || item.deadline,
          deadline: item.submissionDeadline || item.deadline,
          totalABC: item.totalABC || 0,
        }))
        return [...formattedApi, ...preservedMocks]
      })
    }
  }, [apiResponse])

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editEntryId, setEditEntryId] = React.useState<string | null>(null)
  const [viewEntry, setViewEntry] = React.useState<DirectContractingRecord | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)
  const [confirmSubmitId, setConfirmSubmitId] = React.useState<string | null>(null)
  const [bulkDeleteRows, setBulkDeleteRows] = React.useState<DirectContractingRecord[] | null>(null)

  // Row Action Handlers
  const handlers: TableActionHandlers = React.useMemo(
    () => ({
      onCopyDCNumber: (dcNumber: string) => {
        navigator.clipboard.writeText(dcNumber)
        toast({
          title: 'Copied to Clipboard',
          description: `Reference number ${dcNumber} copied successfully.`,
        })
      },
      onViewProposal: (entry: DirectContractingRecord) => {
        setViewEntry(entry)
        setViewOpen(true)
      },
      onEdit: (id: string) => {
        setEditEntryId(id)
      },
      onPromptSubmit: (id: string) => {
        setConfirmSubmitId(id)
      },
      onPromptDelete: (id: string) => {
        setConfirmDeleteId(id)
      },
    }),
    [toast],
  )

  // Single submit execution
  const handleExecuteSubmit = React.useCallback(() => {
    if (!confirmSubmitId) return
    setData((prev) =>
      prev.map((item) =>
        item.id === confirmSubmitId
          ? { ...item, status: 'for-review' as const }
          : item,
      ),
    )
    toast({
      title: 'Request Submitted',
      description: 'The Direct Contracting request has been submitted for BAC review.',
    })
    setConfirmSubmitId(null)
  }, [confirmSubmitId, toast])

  // Single delete execution
  const handleExecuteDelete = React.useCallback(() => {
    if (!confirmDeleteId) return
    setData((prev) => prev.filter((item) => item.id !== confirmDeleteId))
    toast({
      title: 'Request Deleted',
      description: 'The Direct Contracting request has been removed.',
    })
    setConfirmDeleteId(null)
  }, [confirmDeleteId, toast])

  // Bulk submit execution
  const handleBulkSubmit = React.useCallback(
    (selectedRows: DirectContractingRecord[]) => {
      const selectedIds = new Set(selectedRows.map((r) => r.id))
      setData((prev) =>
        prev.map((item) =>
          selectedIds.has(item.id) && item.status === 'draft'
            ? { ...item, status: 'for-review' as const }
            : item,
        ),
      )
      toast({
        title: 'Bulk Action Successful',
        description: `Submitted ${selectedRows.length} request(s) for review.`,
      })
    },
    [toast],
  )

  // Bulk delete execution
  const handleExecuteBulkDelete = React.useCallback(() => {
    if (!bulkDeleteRows) return
    const idsToDelete = new Set(bulkDeleteRows.map((r) => r.id))
    setData((prev) => prev.filter((item) => !idsToDelete.has(item.id)))
    toast({
      title: 'Bulk Action Successful',
      description: `Deleted ${bulkDeleteRows.length} request(s).`,
    })
    setBulkDeleteRows(null)
  }, [bulkDeleteRows, toast])

  // CSV Export
  const handleExportCSV = React.useCallback(
    (recordsToExport: DirectContractingRecord[]) => {
      if (recordsToExport.length === 0) {
        toast({
          title: 'No Data to Export',
          description: 'There are no records available for CSV export.',
        })
        return
      }
      const headers = [
        'DC Number',
        'Project Name',
        'BAC Project Reference',
        'Office',
        'Exclusive Supplier',
        'PhilGEPS Reg',
        'Total ABC (PHP)',
        'Proposal Amount (PHP)',
        'Submission Deadline',
        'Status',
        'Created By',
      ]
      const rows = recordsToExport.map((r) => [
        `"${r.dcNumber}"`,
        `"${(r.name || r.dcName || '').replace(/"/g, '""')}"`,
        `"${(r.bacProjectTitle || r.bacResolutionNumber || '').replace(/"/g, '""')}"`,
        `"${(r.office || '').replace(/"/g, '""')}"`,
        `"${(r.supplierName || r.exclusiveSupplierName || '').replace(/"/g, '""')}"`,
        `"${(r.exclusiveSupplierPhilGEPS || '').replace(/"/g, '""')}"`,
        r.totalABC || 0,
        r.proposalAmount || 0,
        `"${r.submissionDeadline || r.deadline || ''}"`,
        `"${r.status}"`,
        `"${r.createdBy || ''}"`,
      ])
      const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `Direct_Contracting_Requests_${new Date().toISOString().slice(0, 10)}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Exported ${recordsToExport.length} Direct Contracting record(s) to CSV.`,
      })
    },
    [toast],
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Direct Contracting
                </CardTitle>
                <Badge
                  variant="outline"
                  className="h-fit px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20"
                >
                  v9 Datagrid
                </Badge>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Single-source procurement for proprietary items under RA 12009 Rule XVI.
                Strictly requires Proof of Exclusivity & Verified PhilGEPS Certification.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-default-300">
                <Building className="h-3.5 w-3.5 mr-1.5 text-primary" /> RA 12009 / Rule XVI
              </Badge>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> New Direct Contracting
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Modular TanStack Table Component */}
      <DirectContractingTable
        data={data}
        handlers={handlers}
        onBulkSubmit={handleBulkSubmit}
        onBulkDelete={(rows) => setBulkDeleteRows(rows)}
        onExportCSV={handleExportCSV}
      />

      {/* Modals & Confirmation Dialogs */}
      <CreateDirectContractingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {editEntryId && (
        <UpdateDirectContractingModal
          open={!!editEntryId}
          onOpenChange={(v) => {
            if (!v) setEditEntryId(null)
          }}
          editEntryId={editEntryId}
        />
      )}

      {viewEntry && (
        <ViewProposalDetailsModal
          open={viewOpen}
          onOpenChange={(v) => {
            setViewOpen(v)
            if (!v) setViewEntry(null)
          }}
          entry={viewEntry}
        />
      )}

      <ConfirmAlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete Direct Contracting Request?"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleExecuteDelete}
      />

      <ConfirmAlertDialog
        open={!!confirmSubmitId}
        onOpenChange={(v) => !v && setConfirmSubmitId(null)}
        title="Submit Request for BAC Review?"
        description="Are you sure you want to submit this Direct Contracting request for BAC review and validation under Rule XVI?"
        confirmLabel="Submit"
        onConfirm={handleExecuteSubmit}
      />

      <ConfirmAlertDialog
        open={!!bulkDeleteRows}
        onOpenChange={(v) => !v && setBulkDeleteRows(null)}
        title={`Delete ${bulkDeleteRows?.length || 0} Selected Requests?`}
        description={`Are you sure you want to delete ${bulkDeleteRows?.length || 0} selected Direct Contracting requests? This action cannot be undone.`}
        confirmLabel="Delete All Selected"
        onConfirm={handleExecuteBulkDelete}
      />
    </div>
  )
}
