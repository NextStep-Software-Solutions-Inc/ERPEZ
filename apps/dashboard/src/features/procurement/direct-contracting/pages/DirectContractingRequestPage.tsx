"use client"

import * as React from 'react'
import { Building, Plus } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/services/utils/messages'
import type { AxiosError } from 'erpez-shared-lib'
import { useDeleteDirectContracting } from '../handlers'

import { CreateDirectContractingDialog } from '../components/CreateDirectContractingDialog'
import { UpdateDirectContractingDialog } from '../components/UpdateDirectContractingDialog'
import { ViewProposalDetailsModal } from '../components/ViewProposalDetailsModal'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { getDirectContractingsRequest } from '../handlers/getDirectContractingsRequest'

import {
  DirectContractingTable,
  type TableActionHandlers,
} from '../tables'
import type { DirectContracting } from '../types'

const useDirectContractings = createQueryHookFromTemplate(getDirectContractingsRequest)

export function DirectContractingRequestPage() {
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteDirectContracting()
  const [isDeleting, setIsDeleting] = React.useState(false)

  // URL-based Search Parameters & Navigation
  const searchParams = useSearch({
    from: '/v2/(procurement)/direct-contracting-request/',
  })
  const navigate = useNavigate({
    from: '/v2/direct-contracting-request',
  })

  const { pageNumber, pageSize, status, searchQuery } = searchParams

  const updateSearch = React.useCallback(
    (updates: Partial<typeof searchParams>) => {
      navigate({
        search: (prev) => {
          const next = {
            ...prev,
            ...updates,
          }
          if (!next.searchQuery || !next.searchQuery.trim()) {
            next.searchQuery = undefined
            delete next.searchQuery
          }
          return next
        },
        replace: true,
      })
    },
    [navigate],
  )

  // Build Sieve filter string only when filters are active
  const sieveFilters = React.useMemo(() => {
    const filterParts: string[] = []

    if (status && status !== 'all') {
      const statusMap: Record<string, string> = {
        draft: 'DRAFT',
        'for-review': 'FOR_REVIEW',
        'submitted-to-supplier': 'SUBMITTED_TO_SUPPLIER',
        approved: 'APPROVED',
        rejected: 'RETURNED',
        returned: 'RETURNED',
      }
      const backendStatus = statusMap[status.toLowerCase()] || status.toUpperCase()
      filterParts.push(`status==${backendStatus}`)
    }

    if (searchQuery && searchQuery.trim()) {
      filterParts.push(`name@=*${searchQuery.trim()}`)
    }

    return filterParts.length > 0 ? filterParts.join(',') : undefined
  }, [status, searchQuery])

  // API Query listening to URL params
  const { data: directContractings, isLoading } = useDirectContractings({
    pathParams: {},
    queryParams: {
      pageSize: pageSize ?? 10,
      pageNumber: pageNumber ?? 1,
      ...(sieveFilters ? { filters: sieveFilters } : {}),
    },
  })



  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editEntryId, setEditEntryId] = React.useState<string | null>(null)
  const [viewEntry, setViewEntry] = React.useState<DirectContracting | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)
  const [confirmSubmitId, setConfirmSubmitId] = React.useState<string | null>(null)
  const [bulkDeleteRows, setBulkDeleteRows] = React.useState<DirectContracting[] | null>(null)

  // Row Action Handlers
  const handlers: TableActionHandlers = React.useMemo(
    () => ({
      onCopyDCNumber: (dcNumber: string) => {
        navigator.clipboard.writeText(dcNumber)
        toast.success(`Reference number ${dcNumber} copied successfully.`)
      },
      onViewProposal: (entry: DirectContracting) => {
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
  const handleExecuteSubmit = () => { }

  // Single delete execution
  const handleExecuteDelete = async () => {
    if (!confirmDeleteId) return
    const idToDelete = confirmDeleteId
    try {
      setIsDeleting(true)
      await toast.promise(
        deleteMutation.mutateAsync({
          pathParams: { id: idToDelete },
        },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
            },
          }
        ),
      )

      setConfirmDeleteId(null)
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsDeleting(false)
    }
  }

  // Bulk delete execution
  const handleExecuteBulkDelete = async () => {
    if (!bulkDeleteRows || bulkDeleteRows.length === 0) return
    const rowsToDelete = [...bulkDeleteRows]
    try {
      setIsDeleting(true)
      await toast.promise(
        Promise.all(
          rowsToDelete.map((row) =>
            deleteMutation.mutateAsync({
              pathParams: { id: row.id },
            }),
          ),
        ),
        {
          loading: `Deleting ${rowsToDelete.length} Direct Contracting request(s)...`,
          success: `${rowsToDelete.length} Direct Contracting request(s) deleted successfully.`,
          error: (err) => extractErrorMessage(err as AxiosError),
        },
      )
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].includes('direct-contracting'),
      })
      setBulkDeleteRows(null)
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsDeleting(false)
    }
  }

  // CSV Export
  const handleExportCSV = () => { }

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
        directContractings={directContractings}
        isLoading={isLoading}
        handlers={handlers}
        onBulkSubmit={() => { }}
        onBulkDelete={(rows) => setBulkDeleteRows(rows)}
        onExportCSV={handleExportCSV}
        pageNumber={pageNumber}
        pageSize={pageSize}
        status={status}
        searchQuery={searchQuery}
        onPageChange={(page) => updateSearch({ pageNumber: page })}
        onPageSizeChange={(size) => updateSearch({ pageSize: size, pageNumber: 1 })}
        onStatusChange={(status) => updateSearch({ status, pageNumber: 1 })}
        onSearchChange={(query) =>
          updateSearch({ searchQuery: query || undefined, pageNumber: 1 })
        }
      />

      {/* Modals & Confirmation Dialogs */}
      <CreateDirectContractingDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {editEntryId && (
        <UpdateDirectContractingDialog
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
          entry={viewEntry as any}
        />
      )}

      <ConfirmAlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && !isDeleting && setConfirmDeleteId(null)}
        title="Delete Direct Contracting Request?"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete"
        loading={isDeleting}
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
        onOpenChange={(v) => !v && !isDeleting && setBulkDeleteRows(null)}
        title={`Delete ${bulkDeleteRows?.length || 0} Selected Requests?`}
        description={`Are you sure you want to delete ${bulkDeleteRows?.length || 0} selected Direct Contracting requests? This action cannot be undone.`}
        confirmLabel="Delete All Selected"
        loading={isDeleting}
        onConfirm={handleExecuteBulkDelete}
      />
    </div>
  )
}
