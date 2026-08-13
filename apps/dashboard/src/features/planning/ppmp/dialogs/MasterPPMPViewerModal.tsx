import { useState, useMemo, useEffect, useCallback } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Building2,
  CalendarDays,
  Wallet,
  Layers,
  Coins,
  Clock,
  GitMerge,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  User,
  Search,
} from 'lucide-react'
import { getPPMPRequest } from '../handlers'
import { getPPMPActivitiesRequest } from '../handlers/getPPMPActivitiesRequest'
import { getPPMPExpenditureItemsRequest } from '../handlers/getPPMPExpenditureItemsRequest'
import { getPPMPItemsRequest } from '../handlers/getPPMPItemsRequest'
import { formatCurrency } from '../lib'
import type {
  PPMPDetails,
  PPMPActivity,
  PPMPItem,
  PPMPExpenditureItem,
} from '../types'
import { Input } from '@/components/ui/input'

// ─── Query Hooks ─────────────────────────────────────────────────────────────
const usePPMP = createQueryHookFromTemplate(getPPMPRequest)
const usePPMPActivities = createQueryHookFromTemplate(getPPMPActivitiesRequest)
const usePPMPExpenditureItems = createQueryHookFromTemplate(
  getPPMPExpenditureItemsRequest,
)
const usePPMPItems = createQueryHookFromTemplate(getPPMPItemsRequest)

// ─── Utility Formatting ────────────────────────────────────────────────────────
const formatDate = (value: string | null | undefined, withTime = false) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

const PROJECT_TYPE_STYLES: Record<string, string> = {
  Goods: 'bg-sky-50 text-sky-700',
  Services: 'bg-amber-50 text-amber-700',
  Infrastructure: 'bg-orange-50 text-orange-700',
  ConsultingServices: 'bg-violet-50 text-violet-700',
}

const getProjectTypeStyle = (type: string) =>
  PROJECT_TYPE_STYLES[type] ?? 'bg-slate-100 text-slate-600'

interface MasterPPMPViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterPpmpId: string
}

export function MasterPPMPViewerModal({
  open,
  onOpenChange,
  masterPpmpId,
}: MasterPPMPViewerModalProps) {
  // Tabs State
  const [activeSubTab, setActiveSubTab] = useState('overview')

  // Activities Tab State
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  )
  const [activitySearch, setActivitySearch] = useState('')

  // Items Tab State
  const [itemSearch, setItemSearch] = useState('')

  // 1. Fetch Master PPMP Metadata
  const { data: ppmpResp, isLoading: isLoadingPPMP } = usePPMP({
    pathParams: { id: masterPpmpId },
    queryParams: {},
    enabled: open && !!masterPpmpId,
  })
  const masterPpmp: PPMPDetails | null = ppmpResp?.data ?? null

  // 2. Fetch Master PPMP Activities
  const { data: activitiesResp, isLoading: isLoadingActivities } =
    usePPMPActivities({
      pathParams: {},
      queryParams: {
        filters: `ppmpId==${masterPpmpId}`,
        pageSize: 200,
      },
      enabled: open && !!masterPpmpId,
    })
  const activities = activitiesResp?.data ?? []

  // 3. Fetch Master PPMP Items (flat list)
  const { data: itemsResp, isLoading: isLoadingItems } = usePPMPItems({
    pathParams: {},
    queryParams: {
      filters: `ppmpId==${masterPpmpId}`,
      pageSize: 1000,
    },
    enabled: open && !!masterPpmpId,
  })
  const allItems = itemsResp?.data ?? []

  // Selected Activity object helper
  const selectedActivity = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId) ?? null
  }, [activities, selectedActivityId])

  // Reset selected activity if tab switches or modal opens
  useEffect(() => {
    if (activities.length > 0 && !selectedActivityId) {
      setSelectedActivityId(activities[0].id)
    }
  }, [activities, selectedActivityId])

  useEffect(() => {
    if (!open) {
      setActiveSubTab('overview')
      setSelectedActivityId(null)
      setActivitySearch('')
      setItemSearch('')
    }
  }, [open])

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    const q = activitySearch.toLowerCase().trim()
    if (!q) return activities
    return activities.filter((a) => a.activityName?.toLowerCase().includes(q))
  }, [activities, activitySearch])

  // Filtered Flat Items
  const filteredItems = useMemo(() => {
    const q = itemSearch.toLowerCase().trim()
    if (!q) return allItems
    return allItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.originDepartmentName?.toLowerCase().includes(q),
    )
  }, [allItems, itemSearch])

  // Allocations Matrix Data (Item Row with columns for Months)
  const monthsList = [
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

  if (isLoadingPPMP) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          size="3xl"
          className="h-[80vh] flex flex-col justify-center items-center gap-4"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-semibold text-slate-500">
            Loading Consolidated Master PPMP details...
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  if (!masterPpmp) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="md" className="p-6 text-center">
          <Info className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">
            Master PPMP Not Found
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            The consolidated Master PPMP details could not be retrieved from the
            server.
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="5xl"
        className="h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50"
      >
        {/* Sticky Header Banner */}
        <div className="bg-linear-to-r from-indigo-700 via-indigo-850 to-slate-900 text-white p-6 shrink-0 relative shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-indigo-600/35 hover:bg-indigo-600/35 text-indigo-200 border-indigo-500/30 uppercase text-[10px] tracking-wider font-semibold">
                  Master PPMP (Read-Only)
                </Badge>
                {masterPpmp.status && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {masterPpmp.status}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-white mt-1.5">
                {masterPpmp.ppmpNumber ||
                  masterPpmp.documentName ||
                  'Master PPMP Details'}
              </DialogTitle>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 mt-1">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>{masterPpmp.officeName || 'Master Office'}</span>
                <span className="h-2.5 w-px bg-slate-700" />
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>Fiscal Year {masterPpmp.fiscalYearName}</span>
              </div>
            </div>

            {/* Total Budget Card on Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-right min-w-50">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                Consolidated Budget
              </span>
              <span className="text-2xl font-black text-white tracking-tight mt-0.5 block">
                {formatCurrency(masterPpmp.totalEstimatedBudget ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Area */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 shrink-0 flex items-center justify-between">
          <Tabs
            value={activeSubTab}
            onValueChange={setActiveSubTab}
            className="w-full"
          >
            <TabsList
              variant="underline"
              className="w-full justify-start h-auto gap-4"
            >
              <TabsTrigger
                variant="underline"
                value="overview"
                className="text-xs font-bold py-2.5"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="activities"
                className="text-xs font-bold py-2.5"
              >
                Activities ({activities.length})
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="items"
                className="text-xs font-bold py-2.5"
              >
                Items ({allItems.length})
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="allocations"
                className="text-xs font-bold py-2.5"
              >
                Monthly Allocations
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="contributions"
                className="text-xs font-bold py-2.5"
              >
                Department Contributions ({masterPpmp.ChildPPMPs?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger
                variant="underline"
                value="history"
                className="text-xs font-bold py-2.5"
              >
                Approval History ({masterPpmp.ApprovalEvents?.length ?? 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Overview */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Metadata Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Total Estimated Budget
                      </span>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        {formatCurrency(masterPpmp.totalEstimatedBudget ?? 0)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total consolidated cost
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Wallet className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Procurement Library
                      </span>
                      <div
                        className="text-sm font-bold text-slate-900 truncate max-w-42.5 mt-1"
                        title={masterPpmp.libName || '—'}
                      >
                        {masterPpmp.libName || '—'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activities.length} Activities / {allItems.length} Items
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                      <Layers className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Fund Source
                      </span>
                      <div
                        className="text-sm font-bold text-slate-900 truncate max-w-42.5 mt-1"
                        title={masterPpmp.fundSourceName || '—'}
                      >
                        {masterPpmp.fundSourceName || 'General Fund'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Procurement funding source
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Coins className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Timeline Details
                      </span>
                      <div className="text-[10px] text-slate-700 mt-1 flex flex-col gap-0.5">
                        <div>
                          <span className="text-slate-400 font-bold uppercase w-12 inline-block">
                            Sub:
                          </span>{' '}
                          {formatDate(masterPpmp.submittedDate)}
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase w-12 inline-block">
                            App:
                          </span>{' '}
                          {formatDate(masterPpmp.approvedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Master PPMP General Info */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                      Description & Notes
                    </h4>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Document Description
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {masterPpmp.description ||
                          'No description provided for this Master PPMP document.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Created By
                        </span>
                        <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {masterPpmp.createdBy || 'System User'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Last Updated
                        </span>
                        <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(masterPpmp.updatedAt, true)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Box */}
                <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                        Consolidation Status
                      </h4>
                      <div className="flex items-center gap-2">
                        <GitMerge className="h-5 w-5 text-indigo-600 shrink-0" />
                        <span className="text-sm font-bold text-indigo-850">
                          Fully Consolidated Plan
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        This plan consolidates all departmental request
                        documents into a single master plan for centralized
                        procurement processing.
                      </p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3.5 text-xs text-indigo-900 mt-4">
                      <div className="font-bold flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-indigo-600" />
                        Read-Only Mode
                      </div>
                      <div className="mt-1 text-slate-600 leading-normal">
                        All values here are finalized. Modifications are
                        restricted to individual office amendment plans.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Activities (Same workflow layout) */}
          {activeSubTab === 'activities' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Workspace Layout Grid: Left List, Right Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left panel: Activities Selector */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search activities..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="pl-9 h-9 text-xs border-slate-200"
                    />
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    PPMP Activities
                  </div>

                  {isLoadingActivities ? (
                    <div className="text-center py-6 text-xs text-slate-400 italic">
                      Loading activities...
                    </div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 italic">
                      No activities found.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {filteredActivities.map((act) => {
                        const isSelected = selectedActivityId === act.id
                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => setSelectedActivityId(act.id)}
                            className={cn(
                              'w-full text-left p-3 rounded-lg border transition-all flex flex-col justify-between gap-1.5',
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/20'
                                : 'border-slate-100 hover:border-slate-200 bg-white',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">
                                {act.activityName}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 w-full mt-1.5">
                              <span className="font-semibold text-slate-700">
                                {formatCurrency(act.totalAllocationAmount || 0)}
                              </span>
                              <span>{act.totalItems || 0} Items</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Right panel: Activity Detail Render (Read-Only) */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedActivity ? (
                    <ActivityDetailPane activity={selectedActivity} />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm min-h-75">
                      <Layers className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-semibold">No Activity Selected</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Select an activity from the left menu to view its groups
                        and item lists.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Items Flat Table */}
          {activeSubTab === 'items' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Consolidated Procurement Catalog Items
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Flat list of all items requested across all departments and
                    activities.
                  </p>
                </div>
                <div className="relative w-full sm:w-80 shrink-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by item name or origin department..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="pl-9 h-9 text-xs border-slate-200"
                  />
                </div>
              </div>

              {isLoadingItems ? (
                <div className="text-center py-12 text-slate-400 italic">
                  Loading items...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
                  No items found matching the search filters.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3.5">Item Details</th>
                        <th className="px-5 py-3.5">Origin Office</th>
                        <th className="px-5 py-3.5 text-center">Type</th>
                        <th className="px-5 py-3.5 text-center">
                          Procurement Mode
                        </th>
                        <th className="px-5 py-3.5 text-right">Unit Price</th>
                        <th className="px-5 py-3.5 text-right">
                          Total Quantity
                        </th>
                        <th className="px-5 py-3.5 text-right">
                          Estimated Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredItems.map((item) => {
                        const totalQty = (
                          item.PPMPItemAllocations || []
                        ).reduce((sum, a) => sum + (a.quantity || 0), 0)
                        const totalAmount = (
                          item.PPMPItemAllocations || []
                        ).reduce((sum, a) => sum + (a.amount || 0), 0)
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="font-bold text-slate-800">
                                {item.name || 'Unnamed Item'}
                              </div>
                              {item.description && (
                                <div
                                  className="text-[10px] text-slate-400 line-clamp-1 mt-0.5"
                                  title={item.description}
                                >
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              {item.originDepartmentName ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
                                  {item.originDepartmentName}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">
                                  Master Consolidated
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <Badge
                                className={cn(
                                  'text-[9px] font-semibold border-none py-0.5 px-2 rounded-full uppercase',
                                  getProjectTypeStyle(
                                    item.projectType || 'Goods',
                                  ),
                                )}
                              >
                                {item.projectType || 'Goods'}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-center font-semibold text-slate-650">
                              {item.procurementModeName || '—'}
                            </td>
                            <td className="px-5 py-3 text-right text-slate-600">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-slate-800">
                              {totalQty} {item.unit && `(${item.unit})`}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-slate-900">
                              {formatCurrency(totalAmount)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Monthly Allocations Grid */}
          {activeSubTab === 'allocations' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm text-slate-800 font-semibold">
                  12-Month Allocation Matrix (Quantity Distribution)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Spreadsheet view displaying quantity allocations across the
                  calendar months for each procurement line item.
                </p>
              </div>

              {isLoadingItems ? (
                <div className="text-center py-12 text-slate-400 italic">
                  Loading allocation details...
                </div>
              ) : allItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
                  No allocation values recorded for this master plan.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm scrollbar-thin">
                  <table className="w-full border-collapse text-left text-[10px] min-w-300">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3.5 w-60">Item Name</th>
                        <th className="px-4 py-3.5 text-center">Unit</th>
                        {monthsList.map((m) => (
                          <th key={m} className="px-3 py-3.5 text-center w-20">
                            {m.substring(0, 3)}
                          </th>
                        ))}
                        <th className="px-4 py-3.5 text-right w-24">
                          Total Qty
                        </th>
                        <th className="px-4 py-3.5 text-right w-32">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {allItems.map((item) => {
                        const allocMap: Record<string, number> = {}
                        monthsList.forEach((m) => {
                          allocMap[m] = 0
                        })
                        item.PPMPItemAllocations?.forEach((a) => {
                          allocMap[a.allocationMonth] = a.quantity || 0
                        })

                        const totalQty = monthsList.reduce(
                          (sum, m) => sum + allocMap[m],
                          0,
                        )
                        const totalCost = totalQty * item.unitPrice

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td
                              className="px-4 py-2.5 font-bold text-slate-800 truncate max-w-60"
                              title={item.name}
                            >
                              {item.name}
                            </td>
                            <td className="px-4 py-2.5 text-center text-slate-400">
                              {item.unit || '—'}
                            </td>
                            {monthsList.map((m) => {
                              const qty = allocMap[m]
                              return (
                                <td
                                  key={m}
                                  className={cn(
                                    'px-3 py-2.5 text-center',
                                    qty > 0
                                      ? 'bg-indigo-50/30 text-indigo-700 font-bold border-x border-slate-50/50'
                                      : 'text-slate-355',
                                  )}
                                >
                                  {qty > 0 ? qty : '—'}
                                </td>
                              )
                            })}
                            <td className="px-4 py-2.5 text-right font-black text-slate-800">
                              {totalQty}
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-slate-900 bg-indigo-50/5">
                              {formatCurrency(totalCost)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Department Contributions */}
          {activeSubTab === 'contributions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Consolidated Department PPMPs
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    List of individual office/departmental request documents
                    consolidated into this Master PPMP plan.
                  </p>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border text-xs font-semibold px-3 py-1">
                  Total Contributions: {masterPpmp.ChildPPMPs?.length ?? 0}
                </Badge>
              </div>

              {!masterPpmp.ChildPPMPs || masterPpmp.ChildPPMPs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
                  No departmental contributions recorded for this master plan.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {masterPpmp.ChildPPMPs.map((child) => (
                    <Card
                      key={child.id}
                      className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden relative group"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500" />
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              Office/Department
                            </span>
                            <div
                              className="text-sm font-bold text-slate-900 truncate mt-0.5"
                              title={child.officeName || '—'}
                            >
                              {child.officeName || '—'}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold py-0.5 uppercase shrink-0"
                          >
                            {child.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-bold uppercase">
                              Budget Contrib.
                            </span>
                            <div className="font-bold text-slate-800 text-xs mt-0.5">
                              {formatCurrency(child.totalEstimatedBudget ?? 0)}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase">
                              PPMP Number
                            </span>
                            <div
                              className="font-bold text-slate-800 text-xs truncate mt-0.5"
                              title={child.ppmpNumber || '—'}
                            >
                              {child.ppmpNumber || '—'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                          <span>Created: {formatDate(child.createdAt)}</span>
                          {child.submittedDate && (
                            <span>
                              Submitted: {formatDate(child.submittedDate)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Approval History Timeline */}
          {activeSubTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm text-slate-800 font-semibold">
                  Master Approval Sequence Timeline
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological list of approval transactions recorded for this
                  Master PPMP document.
                </p>
              </div>

              {!masterPpmp.ApprovalEvents ||
              masterPpmp.ApprovalEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
                  No approval events recorded in the history log yet.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 pl-6 space-y-6 py-4 max-w-2xl mx-auto font-medium text-slate-700">
                  {masterPpmp.ApprovalEvents.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-7.75 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white">
                        <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                      </span>

                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {evt.actorName}
                            </span>
                            <Badge className="text-[8px] bg-slate-100 hover:bg-slate-100 text-slate-600 border-none font-bold uppercase py-0 px-2 rounded-full">
                              {evt.role || 'Officer'}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(evt.timestamp, true)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="soft"
                            className="bg-emerald-500/10 text-emerald-700 border-none text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide"
                          >
                            {evt.action || 'Approved'}
                          </Badge>
                        </div>

                        {evt.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal mt-2">
                            &ldquo;{evt.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

/**
 * ActivityDetailPane
 * Renders all expenditure items and schedules within a selected activity
 */
function ActivityDetailPane({ activity }: { activity: PPMPActivity }) {
  const [paneTab, setPaneTab] = useState<'items' | 'schedule'>('items')
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Reset tab and expanded items on activity ID change
  useEffect(() => {
    setPaneTab('items')
    setExpandedItemIds(new Set())
  }, [activity.id])

  // Fetch group lists
  const { data: expItemsResp, isLoading: isLoadingGroups } =
    usePPMPExpenditureItems({
      pathParams: {},
      queryParams: { filters: `ppmpActivityId==${activity.id}` },
      enabled: !!activity.id,
    })
  const expenditureGroups = expItemsResp?.data ?? []

  const totalCost = expenditureGroups.reduce(
    (sum, g) => sum + (g.totalCost || 0),
    0,
  )

  return (
    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[45vh]">
      {/* Activity Details Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected Activity
          </h4>
          <h3 className="text-sm font-bold text-slate-800 mt-0.5 leading-tight">
            {activity.activityName}
          </h3>
        </div>

        {/* Inner Tabs toggle */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-lg shrink-0 font-semibold">
          <button
            type="button"
            onClick={() => setPaneTab('items')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-bold rounded-md transition-all',
              paneTab === 'items'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            Expenditure Items ({expenditureGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setPaneTab('schedule')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-bold rounded-md transition-all',
              paneTab === 'schedule'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            Monthly Schedule
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/20 py-3.5 px-5 gap-4">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Allocated Budget
          </span>
          <span className="text-xs font-bold text-slate-800 block mt-0.5">
            {formatCurrency(activity.totalAllocationAmount || 0)}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Items Cost (Sum)
          </span>
          <span className="text-xs font-bold text-slate-800 block mt-0.5">
            {formatCurrency(totalCost)}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Capacity Status
          </span>
          <span className="text-xs font-bold text-slate-800 block mt-0.5">
            {activity.totalItems || 0} Registered Items
          </span>
        </div>
      </div>

      {/* Pane Content Render */}
      <div className="p-5 flex-1 bg-slate-50/5">
        {paneTab === 'items' ? (
          <div className="space-y-4">
            {isLoadingGroups && expenditureGroups.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 italic">
                Loading groups...
              </div>
            ) : expenditureGroups.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                No expenditure groups found under this activity.
              </div>
            ) : (
              expenditureGroups.map((group) => (
                <ExpenditureGroupCard
                  key={group.id}
                  group={group}
                  expandedItemIds={expandedItemIds}
                  onToggleItem={toggleItem}
                />
              ))
            )}
          </div>
        ) : (
          <MonthlyScheduleGrid
            activity={activity}
            expenditureGroups={expenditureGroups}
          />
        )}
      </div>
    </div>
  )
}

/**
 * ExpenditureGroupCard
 * Displays a procurable or non-procurable group + nested items (read-only)
 */
function ExpenditureGroupCard({
  group,
  expandedItemIds,
  onToggleItem,
}: {
  group: PPMPExpenditureItem
  expandedItemIds: Set<string>
  onToggleItem: (id: string) => void
}) {
  const { data: itemsResp, isLoading: isLoadingItems } = usePPMPItems({
    pathParams: {},
    queryParams: { filters: `ppmpExpenditureItemId==${group.id}` },
    enabled: !!group.id,
  })
  const items = itemsResp?.data ?? []

  const itemsCostSum = items.reduce(
    (sum, item) =>
      sum +
      (item.PPMPItemAllocations || []).reduce(
        (itemSum, a) => itemSum + (a.amount || 0),
        0,
      ),
    0,
  )

  return (
    <div className="border border-slate-250 bg-white rounded-xl shadow-sm overflow-hidden font-medium text-slate-700">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-4 py-3 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="font-bold text-slate-800">
            {group.isProcurable ? 'Procurable Items' : 'Non-Procurable Costs'}
          </span>
          <Badge
            className={cn(
              'text-[8px] font-bold py-0 border-none rounded-full',
              group.isProcurable
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700',
            )}
          >
            {group.isProcurable ? 'Procurable' : 'Non-Procurable'}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
          <div>
            Group Cost Limit:{' '}
            <span className="font-bold text-slate-800">
              {formatCurrency(group.totalCost || 0)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            Sum of Items:{' '}
            <span className="font-bold text-slate-850">
              {formatCurrency(itemsCostSum)}
            </span>
          </div>
        </div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-[9px] font-bold text-slate-400 bg-slate-50/10 uppercase tracking-widest">
            <th className="w-10 px-4 py-2.5 text-center" />
            <th className="px-4 py-2.5">Item Name</th>
            <th className="px-4 py-2.5 text-center">Type</th>
            <th className="px-4 py-2.5 text-right">Unit Price</th>
            <th className="px-4 py-2.5 text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {isLoadingItems && items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-4 text-center text-slate-400 italic font-medium"
              >
                Loading items...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-4 text-center text-slate-400 italic font-medium"
              >
                No items recorded in this group.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isExpanded = expandedItemIds.has(item.id)
              const totalAmount = (item.PPMPItemAllocations || []).reduce(
                (sum, a) => sum + (a.amount || 0),
                0,
              )
              return (
                <>
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        {item.name}
                        {item.originDepartmentName && (
                          <Badge
                            variant="outline"
                            className="text-[8px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-150 uppercase tracking-wider font-bold"
                          >
                            {item.originDepartmentName}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge
                        className={cn(
                          'text-[8px] font-bold border-none py-0 px-2 rounded-full',
                          getProjectTypeStyle(item.projectType || 'Goods'),
                        )}
                      >
                        {item.projectType || 'Goods'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-800">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/15">
                      <td colSpan={5} className="px-4 py-3">
                        <ReadOnlyItemDetail item={item} />
                      </td>
                    </tr>
                  )}
                </>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * ReadOnlyItemDetail
 * Renders specs, remarks, schedule, allocations of a single item
 */
function ReadOnlyItemDetail({ item }: { item: PPMPItem }) {
  const months = [
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

  const allocMap = useMemo(() => {
    const map: Record<string, { qty: number; amt: number }> = {}
    months.forEach((m) => {
      map[m] = { qty: 0, amt: 0 }
    })
    item.PPMPItemAllocations?.forEach((a) => {
      if (map[a.allocationMonth]) {
        map[a.allocationMonth] = {
          qty: a.quantity || 0,
          amt: a.amount || 0,
        }
      }
    })
    return map
  }, [item])

  return (
    <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-4 text-xs leading-normal">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Specs */}
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Description & Specs
          </span>
          <p className="text-slate-600 mt-1">
            {item.description || 'No description provided.'}
          </p>
          {item.remarks && (
            <div className="mt-2 bg-slate-100 p-2 rounded italic text-[11px] text-slate-555">
              <span className="font-bold not-italic">Remarks:</span>{' '}
              {item.remarks}
            </div>
          )}
        </div>
        {/* MOP & PAP */}
        <div className="md:border-l border-slate-200 md:pl-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Procurement Configuration
          </span>
          <div className="mt-1 space-y-1.5 text-slate-650">
            <div>
              PAP Code:{' '}
              <span className="font-semibold text-slate-800">
                {item.papCode || '—'}
              </span>
            </div>
            <div>
              Mode:{' '}
              <span className="font-semibold text-slate-800">
                {item.procurementModeName || '—'}
              </span>
            </div>
            {item.mopOverride && item.mopJustification && (
              <div className="text-[10px] bg-amber-50 border border-amber-100 p-1.5 rounded italic text-amber-700">
                Override: {item.mopJustification}
              </div>
            )}
          </div>
        </div>
        {/* Schedules */}
        <div className="md:border-l border-slate-200 md:pl-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
            Procurement Windows
          </span>
          <div className="mt-1.5 space-y-2 text-slate-650">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <div>
                Procurement: {formatDate(item.procurementStartDate)} –{' '}
                {formatDate(item.procurementEndDate)}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <div>
                Delivery: {formatDate(item.expectedDeliveryStart)} –{' '}
                {formatDate(item.expectedDeliveryEnd)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Distribution */}
      <div className="border-t border-slate-200 pt-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
          Quantity Allocation Distribution
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {months.map((m) => {
            const { qty, amt } = allocMap[m]
            const hasVal = qty > 0
            return (
              <div
                key={m}
                className={cn(
                  'p-1.5 rounded border text-center flex flex-col justify-between min-h-11.25',
                  hasVal
                    ? 'bg-indigo-50/20 border-indigo-200 text-indigo-900 font-bold'
                    : 'border-slate-100 text-slate-350',
                )}
              >
                <div className="text-[8px] font-bold uppercase tracking-wider">
                  {m.substring(0, 3)}
                </div>
                {hasVal ? (
                  <div className="mt-1">
                    <div className="text-[10px]">{qty}</div>
                    <div className="text-[7px] text-slate-450 mt-0.5">
                      {formatCurrency(amt)}
                    </div>
                  </div>
                ) : (
                  <div className="text-[8px] mt-1 text-slate-200">—</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * MonthlyScheduleGrid
 * Matrix showing aggregate cost distribution per month for the active activity
 */
function MonthlyScheduleGrid({
  expenditureGroups,
}: {
  activity: PPMPActivity
  expenditureGroups: PPMPExpenditureItem[]
}) {
  const months = [
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

  const monthlyMatrix = useMemo(() => {
    const data: Record<string, { totalAmount: number; itemsCount: number }> = {}
    months.forEach((m) => {
      data[m] = { totalAmount: 0, itemsCount: 0 }
    })

    expenditureGroups.forEach((group) => {
      group.ppmpItems?.forEach((item) => {
        let hasAllocInMonth = false
        item.PPMPItemAllocations?.forEach((a) => {
          if (data[a.allocationMonth]) {
            data[a.allocationMonth].totalAmount += a.amount || 0
            hasAllocInMonth = true
          }
        })
        if (hasAllocInMonth) {
          item.PPMPItemAllocations?.forEach((a) => {
            if (data[a.allocationMonth] && (a.quantity > 0 || a.amount > 0)) {
              data[a.allocationMonth].itemsCount += 1
            }
          })
        }
      })
    })

    return months.map((m) => ({
      month: m,
      amount: data[m].totalAmount,
      count: data[m].itemsCount,
    }))
  }, [expenditureGroups])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          Monthly Allocation Distribution Map
        </h5>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Summary of scheduled amounts and item distributions across fiscal
          calendar periods.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {monthlyMatrix.map(({ month, amount, count }) => {
          const isActive = amount > 0
          return (
            <div
              key={month}
              className={cn(
                'p-4 rounded-xl border flex flex-col justify-between min-h-22.5 transition-all',
                isActive
                  ? 'bg-indigo-50/20 border-indigo-200/50 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 text-slate-400',
              )}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {month}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold text-slate-700 block mt-1.5">
                    {count} {count === 1 ? 'item' : 'items'} scheduled
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">
                  Cost sum
                </span>
                <span className="text-xs font-extrabold text-slate-900 block mt-0.5">
                  {isActive ? formatCurrency(amount) : '₱0.00'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
