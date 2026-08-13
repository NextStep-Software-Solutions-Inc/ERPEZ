import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/services/utils/messages'
import {
  // buildLinkableConsolidatedPrs,
  useApproveBacResolution,
  useBacResolutions,
  useCreateBacResolution,
  useLinkConsolidatedPrs,
  usePrintBacResolution,
  useReturnBacResolution,
  useSubmitBacResolution,
  useUpdateBacResolution,
  useDeleteBacResolution,
} from '../handlers/hooks'
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
import api from '@/services/api'

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

const getErrorMessage = (error: any, fallback: string) => {
  if (error && typeof error === 'object' && ('response' in error || 'request' in error)) {
    return extractErrorMessage(error)
  }
  return error instanceof Error ? error.message : fallback
}

export function useBacResolutionWorkspaceState(
  defaultFilter: BacResolutionInboxFilter = 'all',
  initialSelectedResolutionId?: string,
  workspaceScope: BacResolutionWorkspaceScope = 'all',
) {
  const [resolutions, setResolutions] = useState<BacResolution[]>([])
  const [selectedResolutionId, setSelectedResolutionId] = useState<
    string | null
  >(null)
  const [searchValue, setSearchValue] = useState('')
  const [filter, setFilter] = useState<BacResolutionInboxFilter>(defaultFilter)
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
  const [apiConsolidatedPrs, setApiConsolidatedPrs] = useState<any[]>([])
  const [apiAppItems, setApiAppItems] = useState<any[]>([])

  useEffect(() => {
    if (!createOpen && !linkOpen) return

    let active = true
    const fetchPrs = async () => {
      try {
        const response = await api.get<{ succeeded: boolean; data: any[] }>('/consolidated-prs')
        if (active && response.data?.succeeded) {
          setApiConsolidatedPrs(response.data.data || [])
        }
      } catch (e) {
        console.error('Failed to load consolidated PRs:', e)
      }
    }
    fetchPrs()
    return () => {
      active = false
    }
  }, [createOpen, linkOpen])

  useEffect(() => {
    if (!createOpen) return

    let active = true
    const fetchAppItems = async () => {
      try {
        const response = await api.get<{ succeeded: boolean; data: any[] }>('/app-items')
        if (active && response.data?.succeeded) {
          setApiAppItems(response.data.data || [])
        }
      } catch (e) {
        console.error('Failed to load APP items:', e)
      }
    }
    fetchAppItems()
    return () => {
      active = false
    }
  }, [createOpen])

  const {
    data: bacResolutions,
    isLoading: isBacResolutionsLoading,
    isFetching: isBacResolutionsFetching,
  } = useBacResolutions({})

  const { mutateAsync: createBacResolution, isPending: isCreatePending } =
    useCreateBacResolution()
  const { mutateAsync: updateBacResolution, isPending: isUpdatePending } =
    useUpdateBacResolution()
  const { mutateAsync: deleteBacResolution, isPending: isDeletePending } =
    useDeleteBacResolution()
  const { mutateAsync: linkConsolidatedPrs, isPending: isLinkPending } =
    useLinkConsolidatedPrs()
  const { mutateAsync: submitBacResolution, isPending: isSubmitPending } =
    useSubmitBacResolution()
  const { mutateAsync: printBacResolution, isPending: isPrintPending } =
    usePrintBacResolution()
  const { mutateAsync: approveBacResolution, isPending: isApprovePending } =
    useApproveBacResolution()
  const { mutateAsync: returnBacResolution, isPending: isReturnPending } =
    useReturnBacResolution()

  useEffect(() => {
    setResolutions(bacResolutions ?? [])
  }, [bacResolutions])

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
    return scopedResolutions
      .filter((item) => (filter === 'all' ? true : item.status === filter))
      .filter((item) => {
        if (!searchValue.trim()) return true

        const needle = searchValue.toLowerCase()
        return [
          item.bacResolutionNumber,
          item.description,
          item.createdBy,
          ...item.linkedConsolidatedPrs.map((pr) => pr.prNumber),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
  }, [filter, scopedResolutions, searchValue])

  useEffect(() => {
    if (
      initialSelectedResolutionId &&
      filteredResolutions.some(
        (item) => item.id === initialSelectedResolutionId,
      )
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
    () =>
      scopedResolutions.find((item) => item.id === selectedResolutionId) ??
      null,
    [scopedResolutions, selectedResolutionId],
  )

  const availablePrs = useMemo(
    () => {
      if (!selectedResolution) return []
      
      const mappedApiPrs = apiConsolidatedPrs.map((item) => ({
        id: item.id,
        prNumber: item.cprNumber || 'N/A',
        description: item.description || '',
        endUser: 'N/A',
        projectName: item.description || '',
        amount: 0,
        modeOfProcurement: 'Public Bidding',
        status: 'approved' as const,
      }))

      return buildLinkableConsolidatedPrs({
        availablePrs: mappedApiPrs,
        resolutions,
        currentResolutionId: selectedResolution.id,
      })
    },
    [resolutions, selectedResolution, apiConsolidatedPrs],
  )

  const handleViewConsolidatedPrDetails = (consolidatedPrId: string) => {
    setViewConsolidatedPrId(consolidatedPrId)
    setViewConsolidatedPrOpen(true)
  }

  const isMutating =
    isCreatePending ||
    isUpdatePending ||
    isDeletePending ||
    isLinkPending ||
    isSubmitPending ||
    isPrintPending ||
    isApprovePending ||
    isReturnPending

  const handleCreate = async (payload: CreateBacResolutionPayload) => {
    try {
      const enrichedPayload =
        workspaceScope === 'public-bidding'
          ? { ...payload, workspaceOrigin: 'public-bidding' as const }
          : payload
      const created = await createBacResolution({
        pathParams: {},
        payload: enrichedPayload,
      })
      setResolutions((current) => [created, ...current])
      setSelectedResolutionId(created.id)
      toast.success('BAC Resolution draft created.')
      setCreateOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create BAC Resolution.'))
    }
  }

  const handleUpdate = async (id: string, payload: CreateBacResolutionPayload) => {
    try {
      const enrichedPayload =
        workspaceScope === 'public-bidding'
          ? { ...payload, workspaceOrigin: 'public-bidding' as const }
          : payload
      const updated = await updateBacResolution({
        pathParams: { id },
        payload: enrichedPayload,
      })
      setResolutions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedResolutionId(updated.id)
      toast.success('BAC Resolution draft updated.')
      setEditOpen(false)
      setEditingResolution(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update BAC Resolution.'))
    }
  }

  const handleDelete = (id: string) => {
    setResolutionToDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!resolutionToDeleteId) return
    try {
      await deleteBacResolution({
        pathParams: { id: resolutionToDeleteId },
      })
      setResolutions((current) => current.filter((item) => item.id !== resolutionToDeleteId))
      if (selectedResolutionId === resolutionToDeleteId) {
        setSelectedResolutionId(null)
      }
      toast.success('BAC Resolution deleted.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete BAC Resolution.'))
    } finally {
      setDeleteConfirmOpen(false)
      setResolutionToDeleteId(null)
    }
  }

  const handleLink = async (payload: LinkConsolidatedPrsPayload) => {
    try {
      const updated = await linkConsolidatedPrs({
        pathParams: { id: payload.bacResolutionId },
        payload,
      })
      setResolutions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedResolutionId(updated.id)
      toast.success('Consolidated PR linked.')
      setLinkOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to link Consolidated PRs.'))
    }
  }

  const handleSubmit = () => {
    if (!selectedResolution) return
    setSubmitConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!selectedResolution) return

    try {
      const updated = await submitBacResolution({
        pathParams: { id: selectedResolution.id },
        payload: { bacResolutionId: selectedResolution.id },
      })
      setResolutions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedResolutionId(updated.id)
      toast.success('BAC Resolution submitted for approval.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit BAC Resolution.'))
    } finally {
      setSubmitConfirmOpen(false)
    }
  }

  const handlePrint = async () => {
    if (!selectedResolution) return

    try {
      const result = await printBacResolution({
        pathParams: { id: selectedResolution.id },
      })
      toast.success('BAC Resolution document downloaded.')
      return result
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to download BAC Resolution document.'))
    }
  }

  const handleApprove = async (payload: {
    bacResolutionId: string
    signedDocument: File
  }) => {
    try {
      const updated = await approveBacResolution({
        pathParams: { id: payload.bacResolutionId },
        payload,
      })
      setResolutions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedResolutionId(updated.id)
      toast.success('BAC Resolution approved.')
      setApproveOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to approve BAC Resolution.'))
    }
  }

  const handleReturn = async (payload: {
    bacResolutionId: string
    reason: string
  }) => {
    try {
      const updated = await returnBacResolution({
        pathParams: { id: payload.bacResolutionId },
        payload,
      })
      setResolutions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedResolutionId(updated.id)
      toast.success('BAC Resolution returned for revision.')
      setReturnOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to return BAC Resolution.'))
    }
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
    apiAppItems,
    apiConsolidatedPrs,
  }
}

export type UseBacResolutionWorkspaceState = ReturnType<
  typeof useBacResolutionWorkspaceState
>
