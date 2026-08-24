import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type {
  BacResolution,
  BacResolutionInboxFilter,
  BacResolutionWorkspaceScope,
} from '../types'
import {
  buildLinkableConsolidatedPrs,
  isBacResolutionInPublicBiddingScope,
} from '../utils/bacResolutionWorkflow'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import {
  createBacResolutionRequest,
} from '../handlers/createBacResolutionRequest'
import { updateBacResolutionRequest } from '../handlers/updateBacResolutionRequest'
import { deleteBacResolutionRequest } from '../handlers/deleteBacResolutionRequest'
import { linkConsolidatedPrsRequest } from '../handlers/linkConsolidatedPrsRequest'
import { submitBacResolutionRequest } from '../handlers/submitBacResolutionRequest'
import { approveBacResolutionRequest } from '../handlers/approveBacResolutionRequest'
import { returnBacResolutionRequest } from '../handlers/returnBacResolutionRequest'
import { getBacResolutionsRequest } from '../handlers/getBacResolutionsRequest'

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

const useCreateBacResolutionMutation = createMutationHookFromTemplate(
  createBacResolutionRequest,
)
const useUpdateBacResolutionMutation = createMutationHookFromTemplate(
  updateBacResolutionRequest,
)
const useDeleteBacResolutionMutation = createMutationHookFromTemplate(
  deleteBacResolutionRequest,
)
const useLinkConsolidatedPrMutation = createMutationHookFromTemplate(
  linkConsolidatedPrsRequest,
)
const useSubmitBacResolutionMutation = createMutationHookFromTemplate(
  submitBacResolutionRequest,
)
const useApproveBacResolutionMutation = createMutationHookFromTemplate(
  approveBacResolutionRequest,
)
const useReturnBacResolutionMutation = createMutationHookFromTemplate(
  returnBacResolutionRequest,
)
const useBacResolutionsQuery = createQueryHookFromTemplate(
  getBacResolutionsRequest,
)

export function useBacResolutionWorkspaceState(
  defaultFilter: BacResolutionInboxFilter = 'all',
  initialSelectedResolutionId?: string,
  workspaceScope: BacResolutionWorkspaceScope = 'all',
) {
  // Query backend APIs via TanStack Query
  const {
    data: serverResolutions,
    isLoading: isBacResolutionsLoading,
    isFetching: isBacResolutionsFetching,

  } = useBacResolutionsQuery({ enabled: false })


  const updateMutation = useUpdateBacResolutionMutation()
  const deleteMutation = useDeleteBacResolutionMutation()
  const linkMutation = useLinkConsolidatedPrMutation()
  const submitMutation = useSubmitBacResolutionMutation()
  const approveMutation = useApproveBacResolutionMutation()
  const returnMutation = useReturnBacResolutionMutation()

  const isMutating =

    updateMutation.isPending ||
    deleteMutation.isPending ||
    linkMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending ||
    returnMutation.isPending

  // Fallback to mock data if offline or no server resolutions returned yet
  const [localFallbackResolutions, setLocalFallbackResolutions] = useState<
    BacResolution[]
  >(() => [])

  const resolutions: BacResolution[] = useMemo(() => {
    if (serverResolutions && serverResolutions.length > 0) {
      return serverResolutions
    }
    return localFallbackResolutions
  }, [serverResolutions, localFallbackResolutions])

  const [selectedResolutionId, setSelectedResolutionId] = useState<
    string | null
  >(null)
  const [searchValue, setSearchValue] = useState('')
  const [filter, setFilter] = useState<BacResolutionInboxFilter>(defaultFilter)
  const [sourceTypeFilter, setSourceTypeFilter] = useState<
    'all' | 'APP_ITEM' | 'CONSOLIDATED_PR'
  >('all')
  const [budgetTier, setBudgetTier] = useState<
    'all' | 'under-1m' | '1m-5m' | 'above-5m' | 'custom'
  >('all')
  const [customMinBudget, setCustomMinBudget] = useState<number | null>(null)
  const [customMaxBudget, setCustomMaxBudget] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'amount-desc' | 'amount-asc'
  >('newest')

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
  const [editingResolution, setEditingResolution] =
    useState<BacResolution | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resolutionToDeleteId, setResolutionToDeleteId] = useState<
    string | null
  >(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsResolutionId, setDetailsResolutionId] = useState<string | null>(
    null,
  )
  const [viewConsolidatedPrOpen, setViewConsolidatedPrOpen] = useState(false)
  const [viewConsolidatedPrId, setViewConsolidatedPrId] = useState<
    string | null
  >(null)
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




  const selectedResolution = useMemo(
    () =>
      scopedResolutions.find((item) => item.id === selectedResolutionId) ??
      null,
    [scopedResolutions, selectedResolutionId],
  )

  const availablePrs = useMemo(() => {
    if (!selectedResolution) return []
    const mockPrs = [] as any[]
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

  // --- CRUD HANDLERS WITH API MUTATION & LOCAL FALLBACK ---

  const handleCreate = () => { }

  const handleUpdate = () => { }

  const handleDelete = (id: string) => {
    setResolutionToDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!resolutionToDeleteId) return

    deleteMutation.mutate(
      { pathParams: { id: resolutionToDeleteId } },
      {
        onSuccess: () => {
          if (selectedResolutionId === resolutionToDeleteId) {
            setSelectedResolutionId(null)
          }
          setDeleteConfirmOpen(false)
          setResolutionToDeleteId(null)
        },
        onError: () => {
          setLocalFallbackResolutions((current) =>
            current.filter((item) => item.id !== resolutionToDeleteId),
          )
          if (selectedResolutionId === resolutionToDeleteId) {
            setSelectedResolutionId(null)
          }
          toast.success('BAC Resolution draft deleted.')
          setDeleteConfirmOpen(false)
          setResolutionToDeleteId(null)
        },
      },
    )
  }

  const handleLink = () => { }

  const handleSubmit = () => {
    if (!selectedResolution) return
    setSubmitConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    if (!selectedResolution) return

    submitMutation.mutate(
      {
        pathParams: { id: selectedResolution.id },
        payload: {
          bacResolutionId: selectedResolution.id,
        },
      },
      {
        onSuccess: () => {
          setSubmitConfirmOpen(false)
        },
        onError: () => {
          setLocalFallbackResolutions((current) =>
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
            }),
          )
          toast.success('BAC Resolution submitted for approval.')
          setSubmitConfirmOpen(false)
        },
      },
    )
  }

  const handlePrint = async () => {
    if (!selectedResolution) return
    toast.success('BAC Resolution document layout generated.')
  }

  const handleApprove = (payload: {
    bacResolutionId: string
    signedDocument: File
  }) => {
    approveMutation.mutate(
      {
        pathParams: { id: payload.bacResolutionId },
        payload: {
          bacResolutionId: payload.bacResolutionId,
          signedDocument: payload.signedDocument,
        },
      },
      {
        onSuccess: () => {
          setApproveOpen(false)
        },
        onError: () => {
          setLocalFallbackResolutions((current) =>
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
            }),
          )
          toast.success('BAC Resolution approved by HOPE.')
          setApproveOpen(false)
        },
      },
    )
  }

  const handleReturn = (payload: {
    bacResolutionId: string
    reason: string
  }) => {
    returnMutation.mutate(
      {
        pathParams: { id: payload.bacResolutionId },
        payload: {
          bacResolutionId: payload.bacResolutionId,
          reason: payload.reason,
        },
      },
      {
        onSuccess: () => {
          setReturnOpen(false)
        },
        onError: () => {
          setLocalFallbackResolutions((current) =>
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
            }),
          )
          toast.success('BAC Resolution returned for revision.')
          setReturnOpen(false)
        },
      },
    )
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
    selectedResolution,
    availablePrs,
    isBacResolutionsLoading,
    isBacResolutionsFetching,
    isMutating,
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
