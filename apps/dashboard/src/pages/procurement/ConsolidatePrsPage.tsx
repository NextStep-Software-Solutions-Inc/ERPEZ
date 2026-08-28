import React, { useMemo, useState, type ChangeEvent } from 'react'
import { formatCurrencyPHP } from '@/utils/formatters'
import {
  useConsolidatedPrs,
  useConsolidatedPr,
  useEligiblePrs,
  useCreateConsolidatedPr,
  useAddPrsToConsolidatedPr,
  useUpdateConsolidatedPrItem,
  useSubmitConsolidatedPr,
  useApproveConsolidatedPr,
  useReturnConsolidatedPr,
  useProcurementModes,
} from '@/features/procurement/consolidated-pr/handlers/hooks'
import type { EligiblePr } from '@/features/procurement/consolidated-pr/types/apiTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Link } from '@tanstack/react-router'
import {
  Search,
  Download,
  FileText,
  CheckCircle,
  Wallet,
  GitMerge,
  MoreHorizontal,
  Calendar,
  ChevronDown,
  PackageOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import DebouncedInput from '@/components/DebouncedInput'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'

export type ConsolidatedPR = {
  id: string
  cprNumber: string 
  date: string
  description?: string
  purpose?: string
  status: 'DRAFT' | 'APPROVED/FOR BAC UTILIZATION' | 'SUBMITTED' | string
  selectedPRItems: SelectedPRItem[]
  itemMOPs: Record<string, { mop?: string; allowPartial?: boolean }>
}

export type SelectedPRItem = {
  id: string
  prId: string
  prOffice: string
  itemName: string
  unit: string
  qty: number
  unitPrice: number
  totalAmount: number
  category: string
  prType: 'non-cse' | 'out-of-stock'
  month: string
  fund: string
}

export type SourcePR = {
  id: string
  office: string
  month: string
  fund: string
  category: string
  type: 'non-cse' | 'out-of-stock'
  items: {
    name: string
    unit: string
    qty: number
    unitPrice: number
    totalRequired?: number
    currentTotal?: number
    deficit?: number
  }[]
}

const formatCurrency = formatCurrencyPHP

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split('-')

  if (!year || !month) {
    return monthValue
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const monthIndex = Number(month) - 1
  return monthNames[monthIndex] || monthValue
}

function matchesMonthFilter(storedMonth: string, filterMonth: string): boolean {
  if (filterMonth === 'all') return true

  const fullMonthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const [, month] = storedMonth.split('-')
  if (!month) return false

  const monthIndex = Number(month) - 1
  return fullMonthNames[monthIndex] === filterMonth
}

export default function ConsolidatePrsPage() {
  const addPrsMutation = useAddPrsToConsolidatedPr()
  const submitMutation = useSubmitConsolidatedPr()
  const updateItemMutation = useUpdateConsolidatedPrItem()
  const createMutation = useCreateConsolidatedPr()

  const { data: cprListResponse } = useConsolidatedPrs({
    pathParams: {},
    queryParams: { PageSize: 100 },
  })

  const consolidatedPRs = useMemo(() => {
    if (!cprListResponse?.data) return []
    return cprListResponse.data.map((item) => ({
      id: item.id,
      cprNumber: item.cprNumber,
      date: item.consolidationDate,
      description: item.description,
      purpose: '',
      status: item.status as ConsolidatedPR['status'],
      selectedPRItems: [] as SelectedPRItem[],
      itemMOPs: {} as Record<string, { mop?: string; allowPartial?: boolean }>,
    }))
  }, [cprListResponse])

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [createDate, setCreateDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [createDescription, setCreateDescription] = useState<string>('')
  const [createPurpose, setCreatePurpose] = useState<string>('')

  const { data: cprDetailResponse } = useConsolidatedPr({
    pathParams: { id: activeId ?? '' },
    queryParams: {},
    enabled: Boolean(activeId),
  })

  const activePR = useMemo(() => {
    if (!activeId) return null
    const listItem = consolidatedPRs.find((c) => c.id === activeId)
    const detailData = cprDetailResponse?.data

    if (detailData) {
      const selectedPRItems: SelectedPRItem[] = (detailData.prs ?? []).flatMap((prLinked) => {
        return prLinked.items.map((item) => ({
          id: item.consolidatedPRItemId || item.prItemId,
          prId: prLinked.prNumber || prLinked.purchaseRequestId,
          prOffice: prLinked.officeName || prLinked.officeId,
          itemName: item.name,
          unit: item.unit,
          qty: item.totalQuantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          category: item.category,
          prType: prLinked.prType?.toLowerCase() === 'non-cse' ? 'non-cse' : 'out-of-stock',
          month: 'Jan',
          fund: item.fund,
        }))
      })

      const itemMOPs: Record<string, { mop?: string; allowPartial?: boolean }> = {}
      ;(detailData.prs ?? []).forEach((prLinked) => {
        prLinked.items.forEach((item) => {
          const key = item.consolidatedPRItemId || item.prItemId
          itemMOPs[key] = {
            mop: item.procurementModeId || undefined,
            allowPartial: item.allowPartial || false,
          }
        })
      })

      return {
        id: detailData.id,
        cprNumber: detailData.cprNumber,
        date: detailData.consolidationDate,
        description: detailData.description,
        purpose: detailData.purpose,
        status: detailData.status as ConsolidatedPR['status'],
        selectedPRItems,
        itemMOPs,
      }
    }

    return listItem ?? null
  }, [activeId, consolidatedPRs, cprDetailResponse])

  const { data: procurementModesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const mopOptions = useMemo(
    () =>
      (procurementModesResponse?.data ?? [])
        .filter((m) => m.isActive && !m.isArchived)
        .map((m) => ({ value: m.id as string, label: m.name as string })),
    [procurementModesResponse],
  )

  const draftCount = useMemo(
    () => consolidatedPRs.filter((pr) => pr.status === 'DRAFT').length,
    [consolidatedPRs],
  )
  const approvedCount = useMemo(
    () =>
      consolidatedPRs.filter(
        (pr) => pr.status === 'APPROVED/FOR BAC UTILIZATION' || pr.status === 'APPROVED',
      ).length,
    [consolidatedPRs],
  )
  const totalAmount = useMemo(
    () =>
      consolidatedPRs.reduce(
        (sum, pr) =>
          sum + pr.selectedPRItems.reduce((s, item) => s + item.totalAmount, 0),
        0,
      ),
    [consolidatedPRs],
  )

  const [addOpen, setAddOpen] = useState(false)
  const [selectedSourcePRIds, setSelectedSourcePRIds] = useState<
    Record<string, boolean>
  >({})
  const [expandedSourcePRs, setExpandedSourcePRs] = useState<Set<string>>(
    new Set(),
  )
  const [expandedPRs, setExpandedPRs] = useState<Set<string>>(new Set())
  const [expandedScheduleItemIds, setExpandedScheduleItemIds] = useState<Set<string>>(new Set())

  const toggleScheduleItemExpansion = (id: string) => {
    setExpandedScheduleItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  const [addSearchTerm, setAddSearchTerm] = useState<string>('')
  const [addCategoryFilter, setAddCategoryFilter] = useState<string>('all')
  const [addMonthFilter, setAddMonthFilter] = useState<string>('all')
  const [addFundFilter, setAddFundFilter] = useState<string>('all')
  const [addTargetFilter, setAddTargetFilter] = useState<string>('all')

  const { data: eligiblePrsResponse } = useEligiblePrs({
    pathParams: { id: activePR?.id ?? '' },
    enabled: Boolean(activePR?.id) && (addOpen || Boolean(activePR)),
  })

  const sourcePRs = useMemo<SourcePR[]>(() => {
    if (!eligiblePrsResponse?.data) return []
    return eligiblePrsResponse.data.map((pr: EligiblePr) => ({
      id: pr.prNumber || pr.purchaseRequestId,
      office: pr.officeName || pr.officeId,
      month: 'Jan',
      fund: pr.items[0]?.fund || '',
      category: pr.items[0]?.category || '',
      type: pr.prType?.toLowerCase() === 'non-cse' ? 'non-cse' : 'out-of-stock',
      items: pr.items.map((item) => ({
        name: item.name,
        unit: item.unit,
        qty: item.totalQuantity,
        unitPrice: item.unitPrice,
        totalRequired: item.totalQuantity,
        currentTotal: item.totalQuantity,
        deficit: item.totalQuantity,
      })),
    }))
  }, [eligiblePrsResponse])

  // Workflow states
  const approveMutation = useApproveConsolidatedPr()
  const returnMutation = useReturnConsolidatedPr()
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [returnRemarks, setReturnRemarks] = useState('')
  const [actionCprId, setActionCprId] = useState<string | null>(null)

  // consolidated PRs list search
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showExportDialog, setShowExportDialog] = useState(false)

  const filteredConsolidatedPRs = useMemo(() => {
    const q = (searchTerm ?? '').trim().toLowerCase()
    if (!q) return consolidatedPRs
    return consolidatedPRs.filter((c) => {
      return (
        c.id.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.purpose ?? '').toLowerCase().includes(q)
      )
    })
  }, [consolidatedPRs, searchTerm])

  function handleCreate() {
    if (!createDate) {
      toast.error('Date is required', {
        description: 'Please choose a date (date-only).',
      })
      return
    }

    toast.promise(
      createMutation.mutateAsync({
        pathParams: {},
        payload: {
          consolidationDate: createDate,
          description: createDescription,
          purpose: createPurpose,
        },
      }).then(() => {
        setCreateOpen(false)
        setCreateDate('')
        setCreateDescription('')
        setCreatePurpose('')
      }),
      {
        loading: 'Creating Consolidated PR...',
        success: 'Consolidated PR created (DRAFT).',
        error: (e: unknown) => (e instanceof Error ? e.message : 'Error creating Consolidated PR'),
      }
    )
  }

  function handleOpenAdd() {
    if (!activePR) return
    setAddOpen(true)
    setSelectedSourcePRIds({})
  }

  function toggleSelectSource(id: string) {
    setSelectedSourcePRIds((s) => ({ ...s, [id]: !s[id] }))
  }

  const toggleExpandSourcePR = (id: string) => {
    setExpandedSourcePRs((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpandPR = (id: string) => {
    setExpandedPRs((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function aggregateSelectedSourcePRs() {
    if (!activePR) return
    const selected = sourcePRs.filter((p) => selectedSourcePRIds[p.id])
    if (selected.length === 0) {
      toast.error('No PR selected', {
        description: 'Please select at least one approved PR to add.',
      })
      return
    }

    toast.promise(
      addPrsMutation.mutateAsync({
        pathParams: { id: activePR.id },
        queryParams: {},
        payload: { purchaseRequestIds: Array.from(new Set(selected.map((p) => p.id))) },
      }).then(() => {
        setAddOpen(false)
      }),
      {
        loading: 'Adding PRs to Consolidated PR...',
        success: 'Selected PRs have been added to this Consolidated PR.',
        error: (e: unknown) => (e instanceof Error ? e.message : 'Failed to add PRs'),
      }
    )
  }

  function handleSubmit() {
    if (!activePR) return
    const missing: string[] = []
    activePR.selectedPRItems.forEach((item) => {
      const key = item.id
      if (!activePR.itemMOPs?.[key]?.mop) {
        missing.push(`${item.itemName} (${item.prId})`)
      }
    })

    if (missing.length > 0) {
      const preview = missing.slice(0, 5).join(', ')
      const more = missing.length > 5 ? ` (+${missing.length - 5} more)` : ''
      toast.error('Cannot submit — missing Mode of Procurement', {
        description: `Please set Mode of Procurement for ${missing.length} item(s): ${preview}${more}`,
      })
      return
    }

    setConfirmOpen(true)
  }

  function confirmSubmit() {
    if (!activePR) return
    setConfirmLoading(true)
    toast.promise(
      submitMutation.mutateAsync({
        pathParams: { id: activePR.id },
      }).then(() => {
        setConfirmOpen(false)
      }).finally(() => {
        setConfirmLoading(false)
      }),
      {
        loading: 'Submitting Consolidated PR...',
        success: 'Consolidated PR finalized.',
        error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to submit Consolidated PR'),
      }
    )
  }

  function handleApproveList(id: string) {
    toast.promise(
      approveMutation.mutateAsync({ pathParams: { id } }),
      {
        loading: 'Approving Consolidated PR...',
        success: 'Consolidated PR approved.',
        error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to approve CPR.'),
      }
    )
  }

  function handleReturnList() {
    if (!actionCprId) return
    if (!returnRemarks.trim()) {
      toast.error('Remarks Required', { description: 'Please provide a reason.' })
      return
    }

    toast.promise(
      returnMutation.mutateAsync({
        pathParams: { id: actionCprId },
        queryParams: {},
        payload: { remarks: returnRemarks },
      }).then(() => {
        setShowReturnDialog(false)
        setReturnRemarks('')
        setActionCprId(null)
      }),
      {
        loading: 'Returning Consolidated PR...',
        success: 'Consolidated PR returned.',
        error: (err: unknown) => (err instanceof Error ? err.message : 'Failed to return CPR.'),
      }
    )
  }

  const filteredSourcePRs = sourcePRs.filter((p) => {
    const term = addSearchTerm.trim().toLowerCase()
    const matchesTerm =
      !term ||
      p.id.toLowerCase().includes(term) ||
      p.office.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.items.some((it) => it.name.toLowerCase().includes(term))
    const matchesCat =
      addCategoryFilter === 'all' || p.category === addCategoryFilter
    const matchesMonth = matchesMonthFilter(p.month, addMonthFilter)
    const matchesFund = addFundFilter === 'all' || p.fund === addFundFilter
    const matchesTarget =
      addTargetFilter === 'all' || p.type === addTargetFilter
    return (
      matchesTerm && matchesCat && matchesMonth && matchesFund && matchesTarget
    )
  })

  const selectedCount =
    Object.values(selectedSourcePRIds).filter(Boolean).length

  return (
    <div className="w-full space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Consolidate PRs</CardTitle>
              <CardDescription className="text-base">
                Purchase request consolidation workspace
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold"
              >
                <GitMerge className="h-3.5 w-3.5 mr-1.5" /> Consolidation
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Total Consolidated PRs
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-purple-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-purple-700">
                      {consolidatedPRs.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total PRs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Draft
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-slate-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-700">
                      {draftCount}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {draftCount} Draft PR{draftCount !== 1 ? 's' : ''} •{' '}
                      {approvedCount} Approved PR
                      {approvedCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Approved/For BAC
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center shadow-sm">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-emerald-700">
                      {approvedCount}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Approved PRs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  Total Amount
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center shadow-sm">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-blue-700">
                      ₱{totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total value
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated PRs list */}
      {!activePR && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Consolidated PRs</CardTitle>
              <CardDescription>List of consolidated PRs.</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full flex items-center py-4 gap-1 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <DebouncedInput
                  placeholder="Search by PR ID or description"
                  value={searchTerm}
                  onChange={(val: string) => setSearchTerm(val)}
                  className="w-full pl-10"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  color="primary"
                  onClick={() => {
                    setCreateDate(new Date().toISOString().slice(0, 10))
                    setCreateOpen(true)
                  }}
                  className="gap-2"
                >
                  <span className="text-lg">+</span>
                  <span className="hidden sm:inline">Add Consolidated PR</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border flex-1 flex flex-col min-h-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-transparent border rounded-t-3xl">
                    <TableRow>
                      <TableHead>PR ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredConsolidatedPRs.map((c) => (
                      <TableRow key={c.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{c.cprNumber || c.id}</TableCell>
                        <TableCell>{c.date}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            color={
                              c.status === 'DRAFT' ? 'secondary' : 'default'
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to="/v2/consolidate-prs/$consolidatedPrId" params={{ consolidatedPrId: c.id }}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {c.status?.toUpperCase() === 'SUBMITTED' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleApproveList(c.id)}>
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActionCprId(c.id)
                                      setShowReturnDialog(true)
                                    }}
                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                  >
                                    Return
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredConsolidatedPRs.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-sm text-muted-foreground"
                        >
                          No Consolidated PRs yet. Click Add Consolidated PR to
                          start.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between space-x-2 py-4 mt-3">
              <div className="text-muted-foreground text-sm">
                {filteredConsolidatedPRs.length} row(s)
              </div>
              <div className="text-muted-foreground text-sm">Page 1 of 1</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Consolidated PR Modal */}
      <ResponsiveDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Consolidated PR"
        description="Create a new consolidated purchase request"
        size="md"
        className="max-w-[800px]"
        showCloseButton
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!createDate}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              CREATE
            </Button>
          </div>
        }
      >
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault()
            handleCreate()
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Choose the date for this consolidated PR (date-only).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Input
              type="text"
              value={createDate}
              readOnly
              disabled
              className="h-10 border-gray-200 bg-gray-50 cursor-default"
              aria-label="Consolidated PR date"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              value={createDescription}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCreateDescription(e.target.value)
              }
              placeholder="Brief summary (e.g. Consolidation for January 2026)"
              className="h-10 border-gray-200"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Purpose</label>
            <textarea
              value={createPurpose}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setCreatePurpose(e.target.value)
              }
              className="w-full border border-gray-200 rounded-md p-2 h-28 resize-none"
              placeholder="Optional: describe the purpose or scope of this consolidated PR"
            />
          </div>

          <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
            <div className="font-medium text-gray-700">Visibility</div>
            <div className="text-xs">
              This consolidated PR will remain in Draft and visible only to the
              Procurement Office until published.
            </div>
          </div>
        </form>
      </ResponsiveDialog>

      {/* Details Page */}
      {activePR && (
        <Card className="mt-4">
          <CardHeader>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveId(null)}
              >
                Back to list
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full flex items-start justify-between mb-4">
              <div className="min-w-0">
                <CardTitle className="!text-xl truncate">{`${activePR?.id ?? ''} — ${activePR?.date ?? ''}`}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Consolidation workbench
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activePR?.status === 'DRAFT' && (
                  <Button variant="outline" size="sm" onClick={handleOpenAdd}>
                    Add Agency/Office PR
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!activePR || activePR.status !== 'DRAFT'}
                >
                  Submit
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>List of Consolidated PRs</CardTitle>
                  <CardDescription>
                    {activePR && activePR.selectedPRItems.length > 0
                      ? `${Object.keys(activePR.selectedPRItems.reduce((acc, item) => ({ ...acc, [item.prId]: true }), {})).length} PRs selected`
                      : '0 PRs selected'}
                  </CardDescription>
                </CardHeader>

                <div className="px-6">
                  <div className="flex gap-3 items-end justify-between py-3">
                    <div className="flex gap-3 items-end flex-1">
                      <div className="flex-1 max-w-sm">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by PR number, office, or item..."
                            value={addSearchTerm}
                            onChange={(e) => setAddSearchTerm(e.target.value)}
                            className="pl-10 h-9"
                          />
                        </div>
                      </div>

                      <div style={{ minWidth: 'fit-content' }}>
                        <Select
                          onValueChange={(v) => setAddCategoryFilter(v)}
                          value={addCategoryFilter}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue>
                              {addCategoryFilter === 'all'
                                ? 'All Categories'
                                : addCategoryFilter}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Array.from(
                              new Set(sourcePRs.map((p) => p.category).filter(Boolean)),
                            ).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ minWidth: 'fit-content' }}>
                        <Select
                          onValueChange={(v) => setAddMonthFilter(v)}
                          value={addMonthFilter}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue>
                              {addMonthFilter === 'all'
                                ? 'All Months'
                                : addMonthFilter}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {[
                              'January',
                              'February',
                              'March',
                              'April',
                              'May',
                              'June',
                              'July',
                              'August',
                              'September',
                              'October',
                              'November',
                              'December',
                            ].map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ minWidth: 'fit-content' }}>
                        <Select
                          onValueChange={(v) => setAddFundFilter(v)}
                          value={addFundFilter}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue>
                              {addFundFilter === 'all'
                                ? 'All Funds'
                                : addFundFilter}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Funds</SelectItem>
                            {Array.from(
                              new Set(sourcePRs.map((p) => p.fund).filter(Boolean)),
                            ).map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ minWidth: 'fit-content' }}>
                        <Select
                          onValueChange={(v) => setAddTargetFilter(v)}
                          value={addTargetFilter}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue>
                              {addTargetFilter === 'all'
                                ? 'All Types'
                                : addTargetFilter === 'non-cse'
                                  ? 'Non-CSE'
                                  : 'Out of Stock'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="non-cse">Non-CSE</SelectItem>
                            <SelectItem value="out-of-stock">
                              Out of Stock
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-4">
                  {activePR && activePR.selectedPRItems.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(
                        activePR.selectedPRItems.reduce(
                          (acc, item) => {
                            if (!acc[item.prId]) acc[item.prId] = []
                            acc[item.prId].push(item)
                            return acc
                          },
                          {} as Record<string, typeof activePR.selectedPRItems>,
                        ),
                      ).map(([prId, items]) => {
                        const q = addSearchTerm.trim().toLowerCase()
                        const filteredItems = items.filter((item) => {
                          const matchesSearch =
                            !q ||
                            item.itemName.toLowerCase().includes(q) ||
                            prId.toLowerCase().includes(q) ||
                            item.prOffice.toLowerCase().includes(q)
                          const matchesCat =
                            addCategoryFilter === 'all' ||
                            item.category === addCategoryFilter
                          const matchesMonth =
                            addMonthFilter === 'all' ||
                            matchesMonthFilter(item.month, addMonthFilter)
                          const matchesFund =
                            addFundFilter === 'all' ||
                            item.fund === addFundFilter
                          const matchesType =
                            addTargetFilter === 'all' ||
                            item.prType === addTargetFilter
                          return (
                            matchesSearch &&
                            matchesCat &&
                            matchesMonth &&
                            matchesFund &&
                            matchesType
                          )
                        })

                        if (filteredItems.length === 0) return null

                        const prTotal = filteredItems.reduce(
                          (sum, item) => sum + item.totalAmount,
                          0,
                        )
                        const firstItem = filteredItems[0]
                        const sourcePR = sourcePRs.find(
                          (p) => p.id === prId,
                        )
                        const isExpanded = expandedPRs.has(prId)

                        return (
                          <div
                            key={prId}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div
                              className="px-4 py-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer"
                              onClick={() => toggleExpandPR(prId)}
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {prId} • {firstItem?.prOffice}{' '}
                                  <span className="text-xs text-muted-foreground">
                                    (2026)
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Office: {firstItem?.prOffice} •{' '}
                                  {filteredItems.length} item(s)
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  color="default"
                                  className="text-sm font-semibold"
                                >
                                  {formatCurrency(prTotal)}
                                </Badge>
                                <Badge color="secondary" className="text-xs">
                                  {sourcePR?.type === 'non-cse'
                                    ? 'Non-CSE'
                                    : 'Out of Stock'}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {isExpanded ? '▼' : '▶'}
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t bg-muted/20 overflow-x-auto">
                                <Table>
                                  <TableHeader className="bg-muted/40">
                                    <TableRow>
                                      <TableHead className="w-12 text-center text-xs font-semibold">#</TableHead>
                                      <TableHead className="min-w-[240px] text-xs font-semibold">Item Details</TableHead>
                                      <TableHead className="min-w-[90px] text-xs font-semibold">Category</TableHead>
                                      <TableHead className="min-w-[80px] text-xs font-semibold">Fund</TableHead>
                                      <TableHead className="text-center text-xs font-semibold">Total Qty</TableHead>
                                      <TableHead className="text-xs font-semibold">Unit</TableHead>
                                      <TableHead className="text-right text-xs font-semibold">Unit Price</TableHead>
                                      <TableHead className="text-right text-xs font-semibold">Total Amount</TableHead>
                                      <TableHead className="min-w-[170px] text-xs font-semibold">Allocation / Schedule (From PRs)</TableHead>
                                      <TableHead className="min-w-[190px] text-xs font-semibold">Mode of Procurement (Consolidated PR)</TableHead>
                                      <TableHead className="w-24 text-center text-xs font-semibold">Allow Partial</TableHead>
                                    </TableRow>
                                  </TableHeader>

                                  <TableBody>
                                    {filteredItems.map((item, itemIdx) => {
                                      const itemKey = item.id
                                      const isScheduleExpanded = expandedScheduleItemIds.has(itemKey)
                                      const itemMonthLabel = item.month ? formatMonthLabel(item.month) : null
                                      const hasMonth = Boolean(itemMonthLabel && itemMonthLabel !== '—')

                                      return (
                                        <React.Fragment key={itemKey}>
                                          <TableRow className={cn("transition-colors", isScheduleExpanded && "bg-default-50/40")}>
                                            {/* # with toggle chevron */}
                                            <TableCell className="text-center align-top py-3.5">
                                              <button
                                                type="button"
                                                onClick={() => toggleScheduleItemExpansion(itemKey)}
                                                className="inline-flex items-center justify-center gap-1 font-medium text-foreground hover:text-primary transition-colors text-xs p-1 rounded hover:bg-muted/50"
                                                title={isScheduleExpanded ? 'Collapse schedule details' : 'Expand schedule details'}
                                              >
                                                <span>{itemIdx + 1}</span>
                                                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isScheduleExpanded && "rotate-180")} />
                                              </button>
                                            </TableCell>

                                            {/* Item Details */}
                                            <TableCell className="align-top py-3.5">
                                              <div className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-lg border border-default-200 bg-muted/20 flex items-center justify-center shrink-0 mt-0.5">
                                                  <PackageOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                  <p className="font-semibold text-foreground text-sm leading-snug">
                                                    {item.itemName}
                                                  </p>
                                                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span>PR: {item.prId}</span>
                                                    <span>·</span>
                                                    <span>Item No: {itemIdx + 1}</span>
                                                  </div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Unit Price: {formatCurrency(item.unitPrice)} per {item.unit || 'unit'}
                                                  </p>
                                                </div>
                                              </div>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                              {item.category ?? '—'}
                                            </TableCell>

                                            {/* Fund */}
                                            <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                              {item.fund || '—'}
                                            </TableCell>

                                            {/* Total Qty */}
                                            <TableCell className="align-top py-3.5 text-center font-bold text-sm text-foreground">
                                              {item.qty}
                                            </TableCell>

                                            {/* Unit */}
                                            <TableCell className="align-top py-3.5 text-xs text-muted-foreground">
                                              {item.unit || 'unit'}
                                            </TableCell>

                                            {/* Unit Price */}
                                            <TableCell className="align-top py-3.5 text-right font-medium text-xs text-foreground whitespace-nowrap">
                                              {formatCurrency(item.unitPrice)}
                                            </TableCell>

                                            {/* Total Amount */}
                                            <TableCell className="align-top py-3.5 text-right font-bold text-xs text-foreground whitespace-nowrap">
                                              {formatCurrency(item.totalAmount)}
                                            </TableCell>

                                            {/* Allocation / Schedule */}
                                            <TableCell className="align-top py-3.5">
                                              <div className="space-y-0.5 text-xs">
                                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                                  <span>{hasMonth ? 'Monthly Allocation' : 'No Monthly Allocation'}</span>
                                                </div>
                                                <p className="text-muted-foreground pl-5 leading-tight">
                                                  {hasMonth ? `${itemMonthLabel}: ${item.qty} ${item.unit}` : 'Annual / Overall'}
                                                </p>
                                                <button
                                                  type="button"
                                                  onClick={() => toggleScheduleItemExpansion(itemKey)}
                                                  className="text-primary hover:underline font-medium text-left pl-5 text-xs mt-0.5 block"
                                                >
                                                  {isScheduleExpanded ? 'Hide details' : 'View details'}
                                                </button>
                                              </div>
                                            </TableCell>

                                            {/* Mode of Procurement */}
                                            <TableCell className="align-top py-3.5">
                                              <div className="flex justify-center">
                                                <Select
                                                  value={
                                                    activePR?.itemMOPs?.[itemKey]
                                                      ?.mop || ''
                                                  }
                                                  onValueChange={(val) => {
                                                    if (!activePR) return
                                                    toast.promise(
                                                      updateItemMutation.mutateAsync({
                                                        pathParams: { id: activePR.id, itemId: itemKey },
                                                        queryParams: {},
                                                        payload: { procurementModeId: val, allowPartial: activePR.itemMOPs?.[itemKey]?.allowPartial || false }
                                                      }),
                                                      {
                                                        loading: 'Updating Mode of Procurement...',
                                                        success: 'Mode of Procurement updated.',
                                                        error: (e: unknown) => (e instanceof Error ? e.message : 'Failed to update Mode of Procurement'),
                                                      }
                                                    )
                                                  }}
                                                >
                                                  <SelectTrigger className="w-48 h-9 text-xs">
                                                    <SelectValue placeholder="Select MOP" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {mopOptions.map((mop) => (
                                                      <SelectItem key={mop.value} value={mop.value} className="text-xs">
                                                        {mop.label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </TableCell>

                                            {/* Allow Partial */}
                                            <TableCell className="align-top py-3.5 text-center">
                                              <div className="flex justify-center pt-1.5">
                                                <Checkbox
                                                  checked={
                                                    activePR?.itemMOPs?.[itemKey]
                                                      ?.allowPartial || false
                                                  }
                                                  onCheckedChange={(checked) => {
                                                    if (!activePR) return
                                                    toast.promise(
                                                      updateItemMutation.mutateAsync({
                                                        pathParams: { id: activePR.id, itemId: itemKey },
                                                        queryParams: {},
                                                        payload: { procurementModeId: activePR.itemMOPs?.[itemKey]?.mop || '', allowPartial: checked === true }
                                                      }),
                                                      {
                                                        loading: 'Updating Partial Allowance...',
                                                        success: 'Partial allowance updated.',
                                                        error: (e: unknown) => (e instanceof Error ? e.message : 'Failed to update partial allowance'),
                                                      }
                                                    )
                                                  }}
                                                />
                                              </div>
                                            </TableCell>
                                          </TableRow>

                                          {/* Inline Expandable Schedule Details Panel */}
                                          {isScheduleExpanded && (
                                            <TableRow className="bg-default-50/50 hover:bg-default-50/50 border-b border-default-200">
                                              <TableCell colSpan={11} className="p-4 pl-12 pr-6">
                                                <div className="rounded-xl border border-default-200 bg-white dark:bg-card p-4 shadow-sm space-y-3">
                                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-default-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                        Allocation / Schedule Details (From PRs)
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                      <span>Source PR:</span>
                                                      <Badge variant="outline" className="text-xs font-medium text-primary border-primary/30 bg-primary/5">
                                                        {item.prId}
                                                      </Badge>
                                                    </div>
                                                  </div>

                                                  <div className="overflow-x-auto rounded-lg border border-default-200">
                                                    <Table className="text-xs">
                                                      <TableHeader className="bg-default-50">
                                                        <TableRow>
                                                          <TableHead className="py-2 text-left font-medium min-w-[140px] text-xs">
                                                            Allocated Quantity
                                                          </TableHead>
                                                          {[
                                                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                                                          ].map((m) => (
                                                            <TableHead key={m} className="py-2 text-center font-medium min-w-[44px] text-xs">
                                                              {m}
                                                            </TableHead>
                                                          ))}
                                                          <TableHead className="py-2 text-center font-bold min-w-[60px] text-xs">
                                                            Total
                                                          </TableHead>
                                                        </TableRow>
                                                      </TableHeader>
                                                      <TableBody>
                                                        <TableRow>
                                                          <TableCell className="py-2 font-medium text-muted-foreground text-xs">
                                                            Quantity
                                                          </TableCell>
                                                          {[
                                                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                                                          ].map((m) => {
                                                            const isMatch = itemMonthLabel === m
                                                            const qty = isMatch ? item.qty : 0
                                                            return (
                                                              <TableCell
                                                                key={m}
                                                                className={cn(
                                                                  "py-2 text-center text-xs",
                                                                  qty > 0 ? "font-bold text-foreground" : "text-muted-foreground"
                                                                )}
                                                              >
                                                                {qty}
                                                             </TableCell>
                                                            )
                                                          })}
                                                          <TableCell className="py-2 text-center font-bold text-foreground bg-default-50/60 text-xs">
                                                            {item.qty}
                                                          </TableCell>
                                                        </TableRow>
                                                      </TableBody>
                                                    </Table>
                                                  </div>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </React.Fragment>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {activePR?.status === 'DRAFT'
                        ? 'No PRs selected yet. Use Add Agency/Office PR to select approved PRs.'
                        : 'No PRs in this consolidation.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Agency/Office PR Dialog */}
      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Agency/Office PR"
        description="Select approved PRs from Manage PRs"
        size="4xl"
        showCloseButton
        className="w-full max-w-4xl h-[80vh] max-h-[90vh] flex flex-col"
        footer={
          <div className="flex-shrink-0 border-t bg-white px-6 py-3 flex justify-end gap-3 z-10">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={aggregateSelectedSourcePRs}
              disabled={selectedCount === 0}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              ADD Office PR ({selectedCount})
            </Button>
          </div>
        }
      >
        <div className="overflow-y-auto px-6 py-4 pb-24 flex-1 min-h-0 space-y-4">
          <div className="flex gap-3 items-end justify-between">
            <div className="flex gap-3 items-end flex-1">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by PR ID, office, category, or item"
                    value={addSearchTerm}
                    onChange={(e) => setAddSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              <div style={{ minWidth: 'fit-content' }}>
                <Select
                  onValueChange={(v) => setAddCategoryFilter(v)}
                  value={addCategoryFilter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      {addCategoryFilter === 'all'
                        ? 'All Categories'
                        : addCategoryFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(
                      new Set(sourcePRs.map((p) => p.category).filter(Boolean)),
                    ).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ minWidth: 'fit-content' }}>
                <Select
                  onValueChange={(v) => setAddMonthFilter(v)}
                  value={addMonthFilter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      {addMonthFilter === 'all' ? 'All Months' : addMonthFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ minWidth: 'fit-content' }}>
                <Select
                  onValueChange={(v) => setAddFundFilter(v)}
                  value={addFundFilter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      {addFundFilter === 'all' ? 'All Funds' : addFundFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Funds</SelectItem>
                    {Array.from(
                      new Set(sourcePRs.map((p) => p.fund).filter(Boolean)),
                    ).map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ minWidth: 'fit-content' }}>
                <Select
                  onValueChange={(v) => setAddTargetFilter(v)}
                  value={addTargetFilter}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      {addTargetFilter === 'all'
                        ? 'All Types'
                        : addTargetFilter === 'non-cse'
                          ? 'Non-CSE'
                          : 'Out of Stock'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="non-cse">Non-CSE</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              {filteredSourcePRs.length} Approved PR
              {filteredSourcePRs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-3">
            {filteredSourcePRs.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground border rounded-lg">
                No approved PRs found.
              </div>
            ) : (
              filteredSourcePRs.map((p) => {
                const prTotal = p.items.reduce(
                  (s, it) => s + it.qty * it.unitPrice,
                  0,
                )
                const expanded = expandedSourcePRs.has(p.id)
                const isSelected = !!selectedSourcePRIds[p.id]

                return (
                  <div key={p.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="px-4 py-4 flex items-center gap-4 hover:bg-muted/50 cursor-pointer transition"
                      onClick={() => toggleExpandSourcePR(p.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectSource(p.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {p.id} — {p.office}{' '}
                          <span className="text-xs text-muted-foreground">
                            (2026)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Office: {p.office} • {p.items.length} item(s)
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          color="default"
                          className="text-sm font-semibold"
                        >
                          {formatCurrency(prTotal)}
                        </Badge>
                        <Badge color="secondary" className="text-xs">
                          {p.type === 'non-cse' ? 'Non-CSE' : 'Out of Stock'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {expanded ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t bg-muted/20 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Item Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Fund</TableHead>
                              <TableHead className="text-center">Jan</TableHead>
                              <TableHead className="text-center">Feb</TableHead>
                              <TableHead className="text-center">Mar</TableHead>
                              <TableHead className="text-center">Apr</TableHead>
                              <TableHead className="text-center">May</TableHead>
                              <TableHead className="text-center">Jun</TableHead>
                              <TableHead className="text-center">Jul</TableHead>
                              <TableHead className="text-center">Aug</TableHead>
                              <TableHead className="text-center">Sep</TableHead>
                              <TableHead className="text-center">Oct</TableHead>
                              <TableHead className="text-center">Nov</TableHead>
                              <TableHead className="text-center">Dec</TableHead>
                              <TableHead className="text-center">
                                Total Qty
                              </TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead className="text-right">
                                Total Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {p.items.map((it, idx) => {
                              const monthNames = [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                              ]
                              const itemMonth = formatMonthLabel(p.month)
                              const itemQty =
                                p.type === 'out-of-stock'
                                  ? it.deficit || 0
                                  : it.qty
                              const itemTotal = itemQty * it.unitPrice

                              return (
                                <TableRow key={`${p.id}-item-${idx}`}>
                                  <TableCell className="font-medium">
                                    {it.name}
                                  </TableCell>
                                  <TableCell>{p.category}</TableCell>
                                  <TableCell>{p.fund || '—'}</TableCell>

                                  {monthNames.map((month) => (
                                    <TableCell
                                      key={month}
                                      className="text-center"
                                    >
                                      {itemMonth === month
                                        ? `${itemQty} ${it.unit}`
                                        : `0 ${it.unit}`}
                                    </TableCell>
                                  ))}

                                  <TableCell className="text-center font-semibold">
                                    <Badge variant="outline">
                                      {itemQty} {it.unit}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatCurrency(it.unitPrice)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(itemTotal)}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {selectedCount > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">
                {selectedCount} PR{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>
      </ResponsiveDialog>

      {/* Confirmation Dialog for Submit */}
      <ResponsiveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Finalize Consolidation"
        description={`Are you sure you want to finalize ${activePR?.id ?? 'this Consolidated PR'}? This will set its status to APPROVED/FOR BAC UTILIZATION.`}
        size="sm"
        showCloseButton
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={confirmLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              color="primary"
              className="px-4"
              disabled={confirmLoading}
            >
              {confirmLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <></>
      </ResponsiveDialog>

      <ExportComingSoonDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        entityLabel="Consolidated PR details"
      />

      {/* Return Dialog */}
      <ResponsiveDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        title="Return Consolidated PR"
        description="Please provide a reason for returning this Consolidated PR."
      >
        <div className="space-y-4 py-4">
          <Input
            placeholder="Reason for return..."
            value={returnRemarks}
            onChange={(e) => setReturnRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReturnList}>
              Confirm Return
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  )
}
