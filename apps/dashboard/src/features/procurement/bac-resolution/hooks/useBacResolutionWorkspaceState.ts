import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  getMockBacResolutionDatabase,
  getMockConsolidatedPrs,
} from '../data/mockBacResolutionData'
import type {
  BacResolution,
  BacResolutionInboxFilter,
  BacResolutionWorkspaceScope,
  CreateBacResolutionPayload,
  LinkConsolidatedPrsPayload,
} from '../types'
import {
  buildLinkableConsolidatedPrs,
  isBacResolutionInPublicBiddingScope,
} from '../utils/bacResolutionWorkflow'

const statusOptions: BacResolutionInboxFilter[] = [
  'all',
  'draft',
  'for-approval',
  'returned',
  'approved',
]

function formatInboxFilterLabel(status: BacResolutionInboxFilter) {
  return status === 'all'
    ? 'All'
    : status
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(' ')
}

export function useBacResolutionWorkspaceState(
  defaultFilter: BacResolutionInboxFilter = 'all',
  initialSelectedResolutionId?: string,
  workspaceScope: BacResolutionWorkspaceScope = 'all',
) {
  // Pure local state initialized from mock database for instant frontend MVP workflow
  const [resolutions, setResolutions] = useState<BacResolution[]>(() =>
    getMockBacResolutionDatabase()
  )

  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [filter, setFilter] = useState<BacResolutionInboxFilter>(defaultFilter)
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'APP_ITEM' | 'CONSOLIDATED_PR'>('all')
  const [budgetTier, setBudgetTier] = useState<'all' | 'under-1m' | '1m-5m' | 'above-5m' | 'custom'>('all')
  const [customMinBudget, setCustomMinBudget] = useState<number | null>(null)
  const [customMaxBudget, setCustomMaxBudget] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-desc' | 'amount-asc'>('newest')

  const resetAllFilters = () => {
    setSearchValue('')
    setFilter('all')
    setSourceTypeFilter('all')
    setBudgetTier('all')
    setCustomMinBudget(null)
    setCustomMaxBudget(null)
    setSortBy('newest')
  }

  // Dialog controls
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingResolution, setEditingResolution] = useState<BacResolution | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resolutionToDeleteId, setResolutionToDeleteId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsResolutionId, setDetailsResolutionId] = useState<string | null>(null)
  const [viewConsolidatedPrOpen, setViewConsolidatedPrOpen] = useState(false)
  const [viewConsolidatedPrId, setViewConsolidatedPrId] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)

  // Filtered scoped resolutions
  const scopedResolutions = useMemo(
    () =>
      resolutions.filter((item) =>
        workspaceScope === 'public-bidding'
          ? isBacResolutionInPublicBiddingScope(item)
          : true,
      ),
    [resolutions, workspaceScope],
  )

  const filteredResolutions = useMemo(() => {
    let result = scopedResolutions
      // 1. Status filter
      .filter((item) => (filter === 'all' ? true : item.status === filter))
      // 2. Source Type filter
      .filter((item) => {
        if (sourceTypeFilter === 'all') return true
        return item.sourceType === sourceTypeFilter
      })
      // 3. Budget range filter
      .filter((item) => {
        const amount = item.procurementProjectContext?.abc || item.totalAmount || 0
        if (budgetTier === 'under-1m') return amount < 1000000
        if (budgetTier === '1m-5m') return amount >= 1000000 && amount <= 5000000
        if (budgetTier === 'above-5m') return amount > 5000000
        if (budgetTier === 'custom') {
          if (customMinBudget !== null && amount < customMinBudget) return false
          if (customMaxBudget !== null && amount > customMaxBudget) return false
          return true
        }
        return true
      })
      // 4. Search query
      .filter((item) => {
        if (!searchValue.trim()) return true

        const needle = searchValue.toLowerCase()
        const contextTitle = item.procurementProjectContext?.projectTitle || ''
        const office = item.procurementProjectContext?.officeName || ''
        return [
          item.bacResolutionNumber,
          item.description,
          contextTitle,
          office,
          item.createdBy,
          ...item.linkedConsolidatedPrs.map((pr) => pr.prNumber),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })

    // 5. Sorting
    result = [...result].sort((a, b) => {
      const amountA = a.procurementProjectContext?.abc || a.totalAmount || 0
      const amountB = b.procurementProjectContext?.abc || b.totalAmount || 0
      const dateA = new Date(a.createdAt || a.resolutionDate).getTime()
      const dateB = new Date(b.createdAt || b.resolutionDate).getTime()

      switch (sortBy) {
        case 'oldest':
          return dateA - dateB
        case 'amount-desc':
          return amountB - amountA
        case 'amount-asc':
          return amountA - amountB
        case 'newest':
        default:
          return dateB - dateA
      }
    })

    return result
  }, [
    filter,
    sourceTypeFilter,
    budgetTier,
    customMinBudget,
    customMaxBudget,
    sortBy,
    scopedResolutions,
    searchValue,
  ])

  useEffect(() => {
    if (
      initialSelectedResolutionId &&
      filteredResolutions.some((item) => item.id === initialSelectedResolutionId)
    ) {
      setSelectedResolutionId(initialSelectedResolutionId)
      return
    }

    if (filteredResolutions.length === 0) {
      setSelectedResolutionId(null)
      return
    }

    if (
      !selectedResolutionId ||
      !filteredResolutions.some((item) => item.id === selectedResolutionId)
    ) {
      setSelectedResolutionId(filteredResolutions[0].id)
    }
  }, [filteredResolutions, initialSelectedResolutionId, selectedResolutionId])

  const selectedResolution = useMemo(
    () => scopedResolutions.find((item) => item.id === selectedResolutionId) ?? null,
    [scopedResolutions, selectedResolutionId],
  )

  const availablePrs = useMemo(() => {
    if (!selectedResolution) return []
    const mockPrs = getMockConsolidatedPrs()
    return buildLinkableConsolidatedPrs({
      availablePrs: mockPrs,
      resolutions,
      currentResolutionId: selectedResolution.id,
    })
  }, [resolutions, selectedResolution])

  const handleViewConsolidatedPrDetails = (consolidatedPrId: string) => {
    setViewConsolidatedPrId(consolidatedPrId)
    setViewConsolidatedPrOpen(true)
  }

  // --- LOCAL WORKFLOW CRUD HANDLERS (NO BACKEND HANDLERS) ---

  const handleCreate = (payload: CreateBacResolutionPayload) => {
    const createdRecord: BacResolution = {
      id: `bac-res-${Date.now()}`,
      bacResolutionNumber: payload.bacResolutionNumber,
      resolutionType: (payload.resolutionType as any) || 'procurement-mode-recommendation',
      resolutionDate: payload.resolutionDate || new Date().toISOString().split('T')[0],
      description: payload.description || payload.title || 'Untitled BAC Resolution',
      resolvedDateText:
        payload.resolvedDateText ||
        new Date(payload.resolutionDate).toLocaleDateString('en-PH', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      resolvedLocationText:
        payload.resolvedLocationText ||
        'University of Science and Technology of Southern Philippines, Cagayan de Oro City',
      whereasClauses: payload.whereasClauses || [],
      provisionalMembers: payload.provisionalMembers || [],
      status: 'draft',
      createdBy: 'Procurement Staff Demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalAmount: payload.abc || 0,
      linkedConsolidatedPrs: [],
      activityLog: [
        {
          id: `log-${Date.now()}`,
          action: 'Created draft',
          actor: 'Procurement Staff Demo',
          timestamp: new Date().toISOString(),
        },
      ],
      workspaceOrigin: payload.workspaceOrigin ?? null,
      sourceType: payload.sourceType,
      appItemId: payload.appItemId,
      consolidatedPRId: payload.consolidatedPRId,
      procurementProjectContext: payload.procurementProjectContext,
    }

    setResolutions((current) => [createdRecord, ...current])
    setSelectedResolutionId(createdRecord.id)
    toast.success(`BAC Resolution ${createdRecord.bacResolutionNumber} draft created.`)
    setCreateOpen(false)
  }

  const handleUpdate = (id: string, payload: CreateBacResolutionPayload) => {
    setResolutions((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          bacResolutionNumber: payload.bacResolutionNumber,
          description: payload.description || payload.title || item.description,
          resolutionDate: payload.resolutionDate,
          resolvedDateText: payload.resolvedDateText,
          resolvedLocationText: payload.resolvedLocationText,
          whereasClauses: payload.whereasClauses,
          provisionalMembers: payload.provisionalMembers,
          updatedAt: new Date().toISOString(),
          totalAmount: payload.abc ?? item.totalAmount,
          sourceType: payload.sourceType ?? item.sourceType,
          appItemId: payload.appItemId ?? item.appItemId,
          consolidatedPRId: payload.consolidatedPRId ?? item.consolidatedPRId,
          procurementProjectContext: payload.procurementProjectContext ?? item.procurementProjectContext,
        }
      })
    )
    toast.success('BAC Resolution draft updated.')
    setEditOpen(false)
    setEditingResolution(null)
  }

  const handleDelete = (id: string) => {
    setResolutionToDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!resolutionToDeleteId) return
    setResolutions((current) => current.filter((item) => item.id !== resolutionToDeleteId))
    if (selectedResolutionId === resolutionToDeleteId) {
      setSelectedResolutionId(null)
    }
    toast.success('BAC Resolution draft deleted.')
    setDeleteConfirmOpen(false)
    setResolutionToDeleteId(null)
  }

  const handleLink = (payload: LinkConsolidatedPrsPayload) => {
    const mockPrs = getMockConsolidatedPrs()
    const foundPr = mockPrs.find((p) => p.id === payload.consolidatedPRId)

    if (!foundPr) {
      toast.error('Selected Consolidated PR not found.')
      return
    }

    setResolutions((current) =>
      current.map((item) => {
        if (item.id !== payload.bacResolutionId) return item
        return {
          ...item,
          linkedConsolidatedPrs: [{ ...foundPr }],
          totalAmount: foundPr.amount,
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: `log-${Date.now()}`,
              action: 'Linked Consolidated PR',
              actor: 'Procurement Staff Demo',
              timestamp: new Date().toISOString(),
              note: `Linked ${foundPr.prNumber}`,
            },
            ...item.activityLog,
          ],
        }
      })
    )
    toast.success(`Consolidated PR ${foundPr.prNumber} linked successfully.`)
    setLinkOpen(false)
  }

  const handleSubmit = () => {
    if (!selectedResolution) return
    setSubmitConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (!selectedResolution) return

    setResolutions((current) =>
      current.map((item) => {
        if (item.id !== selectedResolution.id) return item
        return {
          ...item,
          status: 'for-approval',
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: `log-${Date.now()}`,
              action: 'Submitted for approval',
              actor: 'Procurement Staff Demo',
              timestamp: new Date().toISOString(),
            },
            ...item.activityLog,
          ],
        }
      })
    )
    toast.success('BAC Resolution submitted for approval.')
    setSubmitConfirmOpen(false)
  }

  const handlePrint = async () => {
    if (!selectedResolution) return
    toast.success('BAC Resolution document layout generated.')
  }

  const handleApprove = (payload: { bacResolutionId: string; signedDocument: File }) => {
    setResolutions((current) =>
      current.map((item) => {
        if (item.id !== payload.bacResolutionId) return item
        return {
          ...item,
          status: 'approved',
          approvedBy: 'Chairperson Demo',
          approvedAt: new Date().toISOString(),
          signedDocumentFileName: payload.signedDocument.name,
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: `log-${Date.now()}`,
              action: 'Approved by HOPE',
              actor: 'Chairperson Demo',
              timestamp: new Date().toISOString(),
              note: `Signed file attached: ${payload.signedDocument.name}`,
            },
            ...item.activityLog,
          ],
        }
      })
    )
    toast.success('BAC Resolution approved by HOPE.')
    setApproveOpen(false)
  }

  const handleReturn = (payload: { bacResolutionId: string; reason: string }) => {
    setResolutions((current) =>
      current.map((item) => {
        if (item.id !== payload.bacResolutionId) return item
        return {
          ...item,
          status: 'returned',
          returnReason: payload.reason,
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: `log-${Date.now()}`,
              action: 'Returned for revision',
              actor: 'BAC Chairperson Demo',
              timestamp: new Date().toISOString(),
              note: payload.reason,
            },
            ...item.activityLog,
          ],
        }
      })
    )
    toast.success('BAC Resolution returned for revision.')
    setReturnOpen(false)
  }

  const countByStatus = (status: BacResolutionInboxFilter) => {
    if (status === 'all') return scopedResolutions.length
    return scopedResolutions.filter((item) => item.status === status).length
  }

  const inboxCards = statusOptions.map((status) => ({
    status,
    label: formatInboxFilterLabel(status),
    count: countByStatus(status),
  }))

  return {
    resolutions,
    scopedResolutions,
    selectedResolutionId,
    setSelectedResolutionId,
    searchValue,
    setSearchValue,
    filter,
    setFilter,
    sourceTypeFilter,
    setSourceTypeFilter,
    budgetTier,
    setBudgetTier,
    customMinBudget,
    setCustomMinBudget,
    customMaxBudget,
    setCustomMaxBudget,
    sortBy,
    setSortBy,
    resetAllFilters,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    editingResolution,
    setEditingResolution,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    detailsOpen,
    setDetailsOpen,
    detailsResolutionId,
    setDetailsResolutionId,
    viewConsolidatedPrOpen,
    setViewConsolidatedPrOpen,
    viewConsolidatedPrId,
    setViewConsolidatedPrId,
    linkOpen,
    setLinkOpen,
    approveOpen,
    setApproveOpen,
    returnOpen,
    setReturnOpen,
    submitConfirmOpen,
    setSubmitConfirmOpen,
    filteredResolutions,
    selectedResolution,
    availablePrs,
    isBacResolutionsLoading: false,
    isBacResolutionsFetching: false,
    isMutating: false,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleLink,
    handleSubmit,
    handleConfirmSubmit,
    handlePrint,
    handleApprove,
    handleReturn,
    handleViewConsolidatedPrDetails,
    statusOptions,
    inboxCards,
  }
}

export type UseBacResolutionWorkspaceState = ReturnType<
  typeof useBacResolutionWorkspaceState
>
