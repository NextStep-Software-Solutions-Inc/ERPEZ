/**
 * Consolidation of Sub-Office LIBs
 *
 * Premium UI Design inspired by OpcrSelectionUI with:
 * - Clean, professional card-based layout
 * - Two-stage consolidation workflow (Selection → Review)
 * - Search and filtering capabilities
 * - Summary badges with KPI and budget information
 * - Validation status indicators
 */

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Icon } from '@iconify/react'
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SubOfficeLIB {
  id: string
  officeCode: string
  officeName: string
  fiscalYear: string
  status: 'Pending' | 'Approved' | 'Submitted'
  submittedDate: string
  totalPS: number
  totalMOOE: number
  totalCO: number
  total: number
  kpis: KPIBreakdown[]
}

interface KPIBreakdown {
  kpiCode: string
  kpiName: string
  targetAmount: number
  q1: number
  q2: number
  q3: number
  q4: number
}

interface ConsolidatedOfficeData {
  officeCode: string
  officeName: string
  status: string
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
  isValid: boolean
}

interface ConsolidatedKPI {
  kpiCode: string
  kpiName: string
  offices: ConsolidatedOfficeData[]
  consolidatedTotal: number
  variance: number
  isValid: boolean
  hasMismatches: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const mockSubOfficeLIBs: SubOfficeLIB[] = [
  {
    id: 'lib-1',
    officeCode: 'HR-01',
    officeName: 'Human Resources Office',
    fiscalYear: '2025',
    status: 'Approved',
    submittedDate: '2026-03-15',
    totalPS: 500000,
    totalMOOE: 250000,
    totalCO: 100000,
    total: 850000,
    kpis: [
      {
        kpiCode: 'KPI-001',
        kpiName: 'Improve Employee Satisfaction',
        targetAmount: 300000,
        q1: 75000,
        q2: 75000,
        q3: 75000,
        q4: 75000,
      },
      {
        kpiCode: 'KPI-002',
        kpiName: 'Reduce Recruitment Time',
        targetAmount: 550000,
        q1: 137500,
        q2: 137500,
        q3: 137500,
        q4: 137500,
      },
    ],
  },
  {
    id: 'lib-2',
    officeCode: 'FIN-01',
    officeName: 'Finance Office',
    fiscalYear: '2025',
    status: 'Approved',
    submittedDate: '2026-03-16',
    totalPS: 400000,
    totalMOOE: 200000,
    totalCO: 75000,
    total: 675000,
    kpis: [
      {
        kpiCode: 'KPI-001',
        kpiName: 'Improve Employee Satisfaction',
        targetAmount: 200000,
        q1: 50000,
        q2: 50000,
        q3: 50000,
        q4: 50000,
      },
      {
        kpiCode: 'KPI-003',
        kpiName: 'Strengthen Financial Controls',
        targetAmount: 475000,
        q1: 118750,
        q2: 118750,
        q3: 118750,
        q4: 118750,
      },
    ],
  },
  {
    id: 'lib-3',
    officeCode: 'IT-01',
    officeName: 'Information Technology Office',
    fiscalYear: '2025',
    status: 'Approved',
    submittedDate: '2026-03-17',
    totalPS: 600000,
    totalMOOE: 300000,
    totalCO: 150000,
    total: 1050000,
    kpis: [
      {
        kpiCode: 'KPI-002',
        kpiName: 'Reduce Recruitment Time',
        targetAmount: 450000,
        q1: 112500,
        q2: 112500,
        q3: 112500,
        q4: 112500,
      },
      {
        kpiCode: 'KPI-004',
        kpiName: 'Digital Transformation Initiative',
        targetAmount: 600000,
        q1: 150000,
        q2: 150000,
        q3: 150000,
        q4: 150000,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConsolidationTab() {
  const { toast } = useToast()
  const [subOfficeLIBs] = useState<SubOfficeLIB[]>(mockSubOfficeLIBs)
  const [selectedLibIds, setSelectedLibIds] = useState<string[]>([])
  const [expandedKPIs, setExpandedKPIs] = useState<Set<string>>(new Set())
  const [isConsolidating, setIsConsolidating] = useState(false)
  const [consolidationStage, setConsolidationStage] = useState<
    'selection' | 'consolidation'
  >('selection')
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedKPI[]>(
    [],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5
  // View Details dialog state
  const [viewingLib, setViewingLib] = useState<SubOfficeLIB | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Format currency
  const fmt = (num: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)

  // Get approved LIBs
  const approvedLIBs = useMemo(
    () => subOfficeLIBs.filter((lib) => lib.status === 'Approved'),
    [subOfficeLIBs],
  )

  // Filter LIBs by search term
  const filteredLIBs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return approvedLIBs
    return approvedLIBs.filter(
      (lib) =>
        lib.officeName.toLowerCase().includes(query) ||
        lib.officeCode.toLowerCase().includes(query),
    )
  }, [approvedLIBs, searchTerm])

  // Show all filtered LIBs because there are no rendered pagination controls
  const paginatedLIBs = useMemo(() => {
    return filteredLIBs
  }, [filteredLIBs, currentPage, pageSize])

  const totalPages = 1
  const visibleLibIds = filteredLIBs.map((lib) => lib.id)
  const isAllSelected =
    visibleLibIds.length > 0 &&
    visibleLibIds.every((id) => selectedLibIds.includes(id))

  // Event handlers
  const handleSelectAll = () => {
    setSelectedLibIds((prev) => {
      const allSelected =
        visibleLibIds.length > 0 &&
        visibleLibIds.every((id) => prev.includes(id))
      if (allSelected) {
        return prev.filter((id) => !visibleLibIds.includes(id))
      }
      const next = new Set(prev)
      visibleLibIds.forEach((id) => next.add(id))
      return Array.from(next)
    })
  }

  const handleToggleLib = (libId: string) => {
    setSelectedLibIds((prev) =>
      prev.includes(libId)
        ? prev.filter((id) => id !== libId)
        : [...prev, libId],
    )
  }

  const handleClearSelection = () => {
    setSelectedLibIds([])
  }

  const toggleKPIExpansion = (kpiCode: string) => {
    setExpandedKPIs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(kpiCode)) {
        newSet.delete(kpiCode)
      } else {
        newSet.add(kpiCode)
      }
      return newSet
    })
  }

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  // Adjust page if needed
  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(totalPages - 1, 0))
    }
  }, [currentPage, totalPages])

  // Group by KPI
  const groupedByKPI = useMemo(() => {
    const selected = approvedLIBs.filter((lib) =>
      selectedLibIds.includes(lib.id),
    )
    const kpiMap = new Map<string, ConsolidatedKPI>()

    selected.forEach((lib) => {
      lib.kpis.forEach((kpi) => {
        if (!kpiMap.has(kpi.kpiCode)) {
          kpiMap.set(kpi.kpiCode, {
            kpiCode: kpi.kpiCode,
            kpiName: kpi.kpiName,
            offices: [],
            consolidatedTotal: 0,
            variance: 0,
            isValid: true,
            hasMismatches: false,
          })
        }

        const cKPI = kpiMap.get(kpi.kpiCode)!
        const summed = kpi.q1 + kpi.q2 + kpi.q3 + kpi.q4
        const variance = summed - kpi.targetAmount
        const isValid = Math.abs(variance) < 1

        cKPI.offices.push({
          officeCode: lib.officeCode,
          officeName: lib.officeName,
          status: lib.status,
          q1: kpi.q1,
          q2: kpi.q2,
          q3: kpi.q3,
          q4: kpi.q4,
          // show the actual summed quarterly amount so reviewers see the real total
          total: summed,
          isValid,
        })

        if (!isValid) cKPI.hasMismatches = true
        cKPI.consolidatedTotal += kpi.targetAmount
      })
    })

    return Array.from(kpiMap.values())
  }, [approvedLIBs, selectedLibIds])

  const handleConsolidate = async () => {
    if (selectedLibIds.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one LIB to consolidate.',
      })
      return
    }

    setIsConsolidating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setConsolidatedData(groupedByKPI)
      setConsolidationStage('consolidation')
      toast({
        title: 'Consolidation Complete',
        description: `${selectedLibIds.length} LIBs consolidated into ${groupedByKPI.length} KPIs`,
      })
    } catch (error) {
      toast({
        title: 'Consolidation Failed',
        description: 'An error occurred during consolidation',
      })
    } finally {
      setIsConsolidating(false)
    }
  }

  const handleFinalize = async () => {
    setIsConsolidating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Consolidation Finalized',
        description: 'All LIBs have been successfully consolidated and locked.',
      })
      setConsolidationStage('selection')
      setSelectedLibIds([])
      setConsolidatedData([])
      setExpandedKPIs(new Set())
    } finally {
      setIsConsolidating(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: SELECTION
  // ─────────────────────────────────────────────────────────────────────────────

  if (consolidationStage === 'selection') {
    return (
      <div className="w-full space-y-6">
        {/* Empty State */}
        {approvedLIBs.length === 0 ? (
          <Card className="p-16 border-dashed border-2">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Icon
                  icon="mdi:inbox-multiple"
                  className="text-6xl text-slate-300"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Waiting for Office Approvalssss
                </h3>
                <p className="text-sm text-slate-600 mt-2">
                  No approved LIBs are available yet. Sub-offices will submit
                  their LIBs for your review and approval.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Selection Toolbar */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-sm">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search office or LIB name..."
                  className="bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={selectedLibIds.length === 0 || isConsolidating}
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  onClick={handleConsolidate}
                  disabled={selectedLibIds.length === 0 || isConsolidating}
                  className="gap-2"
                >
                  {isConsolidating && (
                    <Icon icon="mdi:loading" className="animate-spin" />
                  )}
                  {isConsolidating
                    ? 'Consolidating...'
                    : 'Consolidate Selected LIBs'}
                </Button>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    id="select-all"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-slate-900 cursor-pointer"
                  >
                    Select All
                  </label>
                  <span className="text-xs text-slate-600">
                    ({selectedLibIds.length}/{visibleLibIds.length})
                  </span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {selectedLibIds.length} selected
                </Badge>
              </div>
            </div>

            {/* LIB Cards */}
            <div className="space-y-4">
              {paginatedLIBs.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-slate-600">No LIBs match your search</p>
                </Card>
              ) : (
                paginatedLIBs.map((lib) => {
                  const isSelected = selectedLibIds.includes(lib.id)
                  const kpiUniqueCount = new Set(lib.kpis.map((k) => k.kpiCode))
                    .size

                  return (
                    <Card
                      key={lib.id}
                      className={cn(
                        'border-2 transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleLib(lib.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">
                                {lib.officeName}
                              </h3>
                              <p className="text-xs text-slate-600 mt-1">
                                {lib.officeCode} • Submitted {lib.submittedDate}
                              </p>
                            </div>
                          </div>

                          {/* Summary Badges */}
                          <div className="flex flex-wrap gap-2 justify-end ml-4">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                            >
                              <Icon
                                icon="mdi:target-multiple"
                                className="mr-1 text-blue-600"
                                width={14}
                                height={14}
                              />
                              {kpiUniqueCount} KPIs
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                            >
                              <Icon
                                icon="mdi:cash"
                                className="mr-1 text-green-600"
                                width={14}
                                height={14}
                              />
                              ₱{(lib.total / 1000000).toFixed(1)}M
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-300"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                              {lib.status}
                            </Badge>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
                              >
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingLib(lib)
                                    setIsViewOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Selection Badge */}
                          {isSelected && (
                            <Badge className="bg-emerald-600 text-white shrink-0 ml-2">
                              <Icon
                                icon="mdi:check"
                                className="mr-1"
                                width={14}
                                height={14}
                              />
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* View Details Dialog */}
            <ResponsiveDialog
              open={isViewOpen}
              onOpenChange={(v) => {
                setIsViewOpen(v)
                if (!v) setViewingLib(null)
              }}
              title={viewingLib ? viewingLib.officeName : 'Office Details'}
              description={
                viewingLib
                  ? `${viewingLib.officeCode} • Submitted ${viewingLib.submittedDate}`
                  : undefined
              }
              size="md"
              showCloseButton
            >
              {viewingLib && (
                <div className="space-y-4 p-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      Totals
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-600">PS</p>
                        <p className="font-bold text-slate-900">
                          {fmt(viewingLib.totalPS)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-600">MOOE</p>
                        <p className="font-bold text-slate-900">
                          {fmt(viewingLib.totalMOOE)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-600">CO</p>
                        <p className="font-bold text-slate-900">
                          {fmt(viewingLib.totalCO)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-slate-600">Total</p>
                      <p className="text-lg font-bold text-blue-600">
                        {fmt(viewingLib.total)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      KPIs
                    </h4>
                    <div className="mt-2 space-y-2">
                      {viewingLib.kpis.map((kpi) => (
                        <div
                          key={kpi.kpiCode}
                          className="border rounded p-3 bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {kpi.kpiName}
                              </p>
                              <p className="text-xs text-slate-600">
                                {kpi.kpiCode}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">
                                {fmt(kpi.targetAmount)}
                              </p>
                              <p className="text-xs text-slate-600">
                                Q1 {fmt(kpi.q1)}, Q2 {fmt(kpi.q2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsViewOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </ResponsiveDialog>
          </>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: CONSOLIDATED VIEW
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Consolidated Master LIB
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Review and validate {consolidatedData.length} consolidated KPI
            allocations
          </p>
        </div>
        {/* upper back button intentionally removed per UX request */}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Total KPIs
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {consolidatedData.length}
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Consolidated key performance indicators
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Valid KPIs
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              {consolidatedData.filter((k) => !k.hasMismatches).length}
            </p>
            <p className="text-xs text-emerald-700 mt-3">
              Passed validation checks
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">
              Issues Found
            </p>
            <p className="text-3xl font-bold text-orange-900">
              {consolidatedData.filter((k) => k.hasMismatches).length}
            </p>
            <p className="text-xs text-orange-700 mt-3">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Accordion */}
      <div className="space-y-3">
        {consolidatedData.map((kpi) => {
          const isExpanded = expandedKPIs.has(kpi.kpiCode)
          const hasWarning = kpi.hasMismatches

          return (
            <Card
              key={kpi.kpiCode}
              className={`border-2 transition-all duration-200 overflow-hidden ${
                hasWarning
                  ? 'border-orange-300 bg-orange-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => toggleKPIExpansion(kpi.kpiCode)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-slate-600">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{kpi.kpiCode}</p>
                    <p className="text-sm text-slate-600 mt-1">{kpi.kpiName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Icon
                        icon="mdi:trending-up"
                        className="text-slate-500"
                        width={12}
                        height={12}
                      />
                      <span className="text-xs text-slate-600 font-semibold">
                        {new Intl.NumberFormat(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(kpi.consolidatedTotal)}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-600">
                        {kpi.offices.length} offices
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasWarning && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 rounded-full text-orange-800 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      Mismatches
                    </div>
                  )}
                  {!hasWarning && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 rounded-full text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Valid
                    </div>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 border-t border-slate-200">
                  <div className="overflow-x-auto">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-bold text-slate-700">
                            Office
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Q1
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Q2
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Q3
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Q4
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Total
                          </TableHead>
                          <TableHead className="text-center font-bold text-slate-700">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpi.offices.map((office, offIdx) => (
                          <TableRow
                            key={offIdx}
                            className={`${!office.isValid ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-slate-50'} transition-colors`}
                          >
                            <TableCell className="font-semibold text-slate-900">
                              <div>
                                <p>{office.officeName}</p>
                                <p className="text-xs text-slate-600 font-normal">
                                  {office.officeCode}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-slate-900 font-semibold">
                              {new Intl.NumberFormat(undefined, {
                                maximumFractionDigits: 0,
                              }).format(office.q1)}
                            </TableCell>
                            <TableCell className="text-right text-slate-900 font-semibold">
                              {new Intl.NumberFormat(undefined, {
                                maximumFractionDigits: 0,
                              }).format(office.q2)}
                            </TableCell>
                            <TableCell className="text-right text-slate-900 font-semibold">
                              {new Intl.NumberFormat(undefined, {
                                maximumFractionDigits: 0,
                              }).format(office.q3)}
                            </TableCell>
                            <TableCell className="text-right text-slate-900 font-semibold">
                              {new Intl.NumberFormat(undefined, {
                                maximumFractionDigits: 0,
                              }).format(office.q4)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600 text-base">
                              {new Intl.NumberFormat(undefined, {
                                maximumFractionDigits: 0,
                              }).format(office.total)}
                            </TableCell>
                            <TableCell className="text-center">
                              {office.isValid ? (
                                <div className="flex justify-center">
                                  <div className="bg-emerald-100 p-2 rounded-full">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="bg-orange-100 p-2 rounded-full">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {consolidatedData.filter((k) => !k.hasMismatches).length}/
            {consolidatedData.length}
          </span>{' '}
          KPIs validated
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="px-6"
            onClick={() => {
              setConsolidationStage('selection')
              setConsolidatedData([])
              setSelectedLibIds([])
              setExpandedKPIs(new Set())
            }}
          >
            Back to Selection
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={isConsolidating}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 shadow-lg hover:shadow-xl transition-all"
          >
            {isConsolidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Finalize Consolidation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
