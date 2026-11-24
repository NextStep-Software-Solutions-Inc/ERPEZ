import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  selectPPMPDialogOpenAtom,
  currentAppAtom,
  appListAtom,
} from '../atoms'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogStepIndicator } from '../components'
import type { AppMaster } from '../types'
import api from '@/services/api'
import { transformAppDetailToAppMaster } from '../utils/transformAppDetail'
import { getAPPDetailRequest } from '../handlers/getAPPDetailRequest'

interface PPMPListItem {
  id: string
  ppmpNumber: string
  officeName?: string
  fiscalYearName?: string
  fiscalYear?: string | number
  fiscalYearYear?: string | number
  fiscalYearId?: string
  fundSourceId?: string
  isFinal?: boolean
  IsFinal?: boolean
  ppmpType?: string
  PPMPType?: string
  sourcePPMPId?: string | null
  SourcePPMPId?: string | null
  supplementalNumber?: number | null
  SupplementalNumber?: number | null
  consolidatedAppId?: string | null
  consolidatedAppNumber?: string | null
  consolidatedAppRootId?: string | null
  PPMPItems?: unknown[]
  [key: string]: unknown
}

interface FundSourceItem {
  id: string
  name: string
  code?: string
}

export function getPpmpPlanType(ppmp: PPMPListItem): 'Supplemental' | 'Final' | 'Indicative' {
  const isSupplemental =
    ppmp.ppmpType === 'Supplemental' ||
    ppmp.PPMPType === 'Supplemental' ||
    Boolean(ppmp.sourcePPMPId || ppmp.SourcePPMPId) ||
    Boolean(ppmp.ppmpNumber?.toUpperCase().startsWith('SUPPLEMENTAL'))
  if (isSupplemental) return 'Supplemental'

  const isFinal = Boolean(ppmp.isFinal ?? ppmp.IsFinal)
  if (isFinal) return 'Final'

  return 'Indicative'
}

function renderPlanTypeBadge(ppmp: PPMPListItem) {
  const planType = getPpmpPlanType(ppmp)

  if (planType === 'Supplemental') {
    const suppNum = ppmp.supplementalNumber ?? ppmp.SupplementalNumber
    return (
      <Badge
        variant="outline"
        className="text-xs font-medium px-2.5 py-0.5 border-purple-200 bg-purple-50 text-purple-700"
      >
        Supplemental {suppNum ? `#${suppNum}` : ''}
      </Badge>
    )
  }

  if (planType === 'Final') {
    return (
      <Badge
        variant="outline"
        className="text-xs font-medium px-2.5 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        Final PPMP
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="text-xs font-medium px-2.5 py-0.5 border-slate-200 bg-slate-50 text-slate-700"
    >
      Indicative
    </Badge>
  )
}

export function SelectPPMPDialog() {
  // ============================================================================
  // SECTION 1: STATE HOOKS (must be first)
  // ============================================================================
  const [open, setOpen] = useAtom(selectPPMPDialogOpenAtom)
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom)
  const [, setAppList] = useAtom(appListAtom)
  const [selectedPPMPIds, setSelectedPPMPIds] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Live API states
  const [ppmps, setPpmps] = useState<PPMPListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fundSources, setFundSources] = useState<FundSourceItem[]>([])
  const [selectedFundSourceId, setSelectedFundSourceId] = useState<string>('all')
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all')
  const [loadingFundSources, setLoadingFundSources] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const queryClient = useQueryClient()

  // 1. Debounce Search Term to prevent API spamming
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // 2. Fetch Fund Sources from live API when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingFundSources(true)
      api.get('/fund-sources', {
        params: {
          PageNumber: 1,
          PageSize: 100
        }
      })
      .then((response) => {
        if (response.data?.succeeded) {
          setFundSources(response.data.data || [])
        } else {
          toast.error(response.data?.message || 'Failed to load Fund Sources')
        }
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load Fund Sources')
      })
      .finally(() => {
        setLoadingFundSources(false)
      })
    } else {
      setFundSources([])
      setSelectedFundSourceId('all')
      setSelectedPlanType('all')
    }
  }, [open])

  // 3. Initialize selection set from currentApp when dialog opens
  useEffect(() => {
    if (open) {
      if (currentApp?.ppmpIds) {
        setSelectedPPMPIds(new Set(currentApp.ppmpIds))
      } else {
        setSelectedPPMPIds(new Set())
      }
    }
  }, [open, currentApp?.ppmpIds])

  // 4. Fetch PPMPs from live API filtered by current APP's Fiscal Year
  useEffect(() => {
    if (open) {
      setLoading(true)
      const params: any = {
        PageNumber: 1,
        PageSize: 100,
      }
      if (debouncedSearch.trim()) {
        params.Search = debouncedSearch.trim()
      }

      const filters: string[] = []
      const fyId = currentApp?.fiscalYearId
      const fyYear = currentApp?.fiscalYear

      // Strictly filter PPMPs by current APP's Fiscal Year
      if (fyId) {
        filters.push(`fiscalYearId==${fyId}`)
      } else if (fyYear) {
        filters.push(`fiscalYearName==${fyYear}`)
      }

      // Strictly filter for Approved PPMPs only (unapproved PPMPs cannot be consolidated into an APP)
      filters.push('status==Approved')

      if (selectedFundSourceId && selectedFundSourceId !== 'all') {
        filters.push(`fundSourceId==${selectedFundSourceId}`)
      }

      if (filters.length > 0) {
        params.Filters = filters.join(',')
      }

      api.get('/ppmps', { params })
      .then((response) => {
        if (response.data?.succeeded) {
          const rawPpmps = response.data.data || []
          // Additional safety filter by Fiscal Year and Approved status
          const fyFiltered = rawPpmps.filter((p: PPMPListItem) => {
            if (fyId && p.fiscalYearId && p.fiscalYearId.toLowerCase() !== fyId.toLowerCase()) return false
            const pYearStr = p.fiscalYearName || p.fiscalYear || p.fiscalYearYear
            if (fyYear && pYearStr && String(pYearStr) !== String(fyYear)) return false
            const statusStr = String(p.status || p.Status || '').toLowerCase()
            if (statusStr !== 'approved') return false
            return true
          })
          setPpmps(fyFiltered)
        } else {
          toast.error(response.data?.message || 'Failed to load PPMPs')
        }
      })
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load PPMPs')
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setPpmps([])
    }
  }, [open, debouncedSearch, selectedFundSourceId, currentApp?.fiscalYearId, currentApp?.fiscalYear])

  // ============================================================================
  // SECTION 2: MEMO HOOKS (must be after useState/useEffect, before useCallback)
  // ============================================================================

  // Helper to determine PPMP eligibility and status
  const getPPMPStatus = useCallback(
    (ppmp: PPMPListItem) => {
      const isAlreadyInCurrentApp =
        currentApp?.ppmpIds?.includes(ppmp.id) ||
        currentApp?.appPpmps?.some((ap: { ppmpId?: string }) => ap.ppmpId === ppmp.id)

      const currentAppRootId = currentApp?.sourceAppId || currentApp?.id

      // Check if linked to an unrelated APP lineage
      const isLinkedToUnrelatedApp = Boolean(
        ppmp.consolidatedAppId &&
        ppmp.consolidatedAppId !== currentApp?.id &&
        ppmp.consolidatedAppRootId &&
        currentAppRootId &&
        ppmp.consolidatedAppRootId.toLowerCase() !== currentAppRootId.toLowerCase()
      )

      const fyId = currentApp?.fiscalYearId
      const fyYear = currentApp?.fiscalYear
      const pYearStr = ppmp.fiscalYearName || ppmp.fiscalYear || ppmp.fiscalYearYear

      const isFiscalYearMismatch = Boolean(
        (fyId && ppmp.fiscalYearId && ppmp.fiscalYearId.toLowerCase() !== fyId.toLowerCase()) ||
        (fyYear && pYearStr && String(pYearStr) !== String(fyYear))
      )

      const planType = getPpmpPlanType(ppmp)
      const isSupplemental = planType === 'Supplemental'
      const isTargetAppUpdated = (currentApp?.appType || '').toLowerCase() === 'updated'

      // Business Rule: Supplemental PPMPs can ONLY be consolidated into an Updated APP.
      // Indicative and Final APPs establish the initial baseline and reject Supplemental PPMPs.
      const isSupplementalMismatch = isSupplemental && !isTargetAppUpdated

      const statusStr = String(ppmp.status || ppmp.Status || '').toLowerCase()
      const isApproved = statusStr === 'approved'

      const isEligible =
        isApproved &&
        !isAlreadyInCurrentApp &&
        !isLinkedToUnrelatedApp &&
        !isFiscalYearMismatch &&
        !isSupplementalMismatch

      let badgeText = 'Available'
      let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300'
      let reasonText = ''

      if (!isApproved) {
        badgeText = 'Unapproved'
        badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300'
        reasonText = `Only approved PPMPs can be consolidated into an APP (current: ${ppmp.status || 'Draft'})`
      } else if (isAlreadyInCurrentApp) {
        badgeText = 'Already Added'
        badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300'
        reasonText = 'Already part of the current APP'
      } else if (isLinkedToUnrelatedApp) {
        badgeText = 'Already Consolidated'
        badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300'
        reasonText = `Already consolidated in ${ppmp.consolidatedAppNumber || 'another APP'}`
      } else if (isFiscalYearMismatch) {
        badgeText = 'Fiscal Year Mismatch'
        badgeStyle = 'bg-red-100 text-red-800 border-red-300'
        reasonText = `Fiscal Year mismatch (${pYearStr || 'Unknown'} vs APP ${fyYear || ''})`
      } else if (isSupplementalMismatch) {
        badgeText = 'Ineligible'
        badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300'
        reasonText = `Supplemental PPMPs can only be consolidated into an Updated APP (current: ${currentApp?.appType || 'Indicative'})`
      }

      return {
        isAlreadyInCurrentApp,
        isLinkedToUnrelatedApp,
        isFiscalYearMismatch,
        isSupplementalMismatch,
        isEligible,
        badgeText,
        badgeStyle,
        reasonText,
        planType,
      }
    },
    [currentApp],
  )

  // Filter displayed PPMPs by search and plan type filter, ensuring unapproved PPMPs do not appear
  const displayedPpmps = useMemo(() => {
    return ppmps
      .filter((p) => String(p.status || p.Status || '').toLowerCase() === 'approved')
      .filter((p) => {
        if (selectedPlanType === 'all') return true
        const type = getPpmpPlanType(p)
        if (selectedPlanType === 'indicative') return type === 'Indicative'
        if (selectedPlanType === 'final') return type === 'Final'
        if (selectedPlanType === 'supplemental') return type === 'Supplemental'
        return true
      })
  }, [ppmps, selectedPlanType])

  // Filter eligible PPMPs from currently displayed list (for select-all)
  const eligibleDisplayedPPMPs = useMemo(() => {
    return displayedPpmps.filter((p) => getPPMPStatus(p).isEligible)
  }, [displayedPpmps, getPPMPStatus])

  // Total eligible across entire loaded set
  const eligiblePPMPs = useMemo(() => {
    return ppmps.filter((p) => getPPMPStatus(p).isEligible)
  }, [ppmps, getPPMPStatus])

  // Selected eligible PPMPs set across all loaded PPMPs
  const selectedEligiblePPMPs = useMemo(() => {
    return ppmps.filter((p) => selectedPPMPIds.has(p.id) && getPPMPStatus(p).isEligible)
  }, [ppmps, selectedPPMPIds, getPPMPStatus])

  // Total items count from selected eligible PPMPs
  const selectedItemsCount = useMemo(() => {
    return selectedEligiblePPMPs.reduce((sum, p) => sum + (p.PPMPItems?.length || 0), 0)
  }, [selectedEligiblePPMPs])

  // ============================================================================
  // SECTION 3: CALLBACK HOOKS (must be after useMemo)
  // ============================================================================
  const togglePPMPSelection = useCallback((ppmpId: string) => {
    const ppmp = ppmps.find((p) => p.id === ppmpId)
    if (!ppmp || !getPPMPStatus(ppmp).isEligible) return

    setSelectedPPMPIds((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(ppmpId)) {
        newSelected.delete(ppmpId)
      } else {
        newSelected.add(ppmpId)
      }
      return newSelected
    })
  }, [ppmps, getPPMPStatus])

  const toggleSelectAll = useCallback(() => {
    setSelectedPPMPIds((prev) => {
      const allEligibleSelected =
        eligibleDisplayedPPMPs.length > 0 &&
        eligibleDisplayedPPMPs.every((p) => prev.has(p.id))
      const newSelected = new Set(prev)

      if (allEligibleSelected) {
        // Deselect all eligible currently displayed
        eligibleDisplayedPPMPs.forEach((p) => newSelected.delete(p.id))
      } else {
        // Select all eligible currently displayed
        eligibleDisplayedPPMPs.forEach((p) => newSelected.add(p.id))
      }
      return newSelected
    })
  }, [eligibleDisplayedPPMPs])

  const handleAddPPMPs = useCallback(async () => {
    if (!currentApp) {
      toast.error('No APP selected')
      return
    }

    const eligibleIdsToSubmit = selectedEligiblePPMPs.map((p) => p.id)
    if (eligibleIdsToSubmit.length === 0) {
      toast.error('Please select at least one eligible PPMP to consolidate')
      return
    }

    setIsAdding(true)
    try {
      // PUT request to associate the selected PPMPs to the APP on the backend
      const response = await api.put(`/apps/${currentApp.id}/select-ppmps`, {
        ppmpIds: eligibleIdsToSubmit,
      })

      if (response.status === 200 || response.data?.succeeded) {
        // Fetch the updated APP detail so the parent page displays it
        const detailResponse = await api.get(`/apps/${currentApp.id}`)
        if (detailResponse.data?.succeeded) {
          const transformedApp = transformAppDetailToAppMaster(detailResponse.data.data)
          setCurrentApp(transformedApp)
          setAppList((prevList) => prevList.map((app) => app.id === currentApp.id ? transformedApp : app))
        }

        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
        })

        toast.success(`${eligibleIdsToSubmit.length} PPMP(s) consolidated successfully`)
        setOpen(false)
        setSelectedPPMPIds(new Set())
        setSearchTerm('')
        setSelectedPlanType('all')
      } else {
        const errorMsg = response.data?.message || 'Failed to select PPMPs'
        toast.error(errorMsg)
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to select PPMPs'
      toast.error(serverMessage)
      console.error('❌ Error during PPMP selection:', error)
    } finally {
      setIsAdding(false)
    }
  }, [currentApp, selectedEligiblePPMPs, setOpen, setAppList, setCurrentApp, queryClient])

  // ============================================================================
  // SECTION 4: CONDITIONAL LOGIC & RENDER (only after ALL hooks)
  // ============================================================================

  if (!currentApp && !open) {
    return null
  }

  if (!currentApp && open) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="2xl" className="z-[99999]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-red-600 font-semibold">No APP selected</p>
            <p className="text-sm text-gray-600 mt-2">Please select an APP first</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const displayApp = currentApp
  const isAllEligibleSelected =
    eligibleDisplayedPPMPs.length > 0 &&
    eligibleDisplayedPPMPs.every((p) => selectedPPMPIds.has(p.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="2xl" className="z-[99999] pointer-events-auto flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0 space-y-2">
          <DialogStepIndicator currentStep={1} totalSteps={4} stepName="Select PPMPs" className="mb-2" />
          <DialogTitle className="text-2xl">Select PPMPs</DialogTitle>
          <DialogDescription className="text-base">
            Choose one or more eligible PPMPs to consolidate into {displayApp?.appName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-6">
          <Input
            placeholder="Search by PPMP number, office, or fiscal year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pointer-events-auto"
            disabled={isAdding || loading}
          />

          {/* Filters: Fund Source & Plan Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Fund Source</Label>
              <Select
                value={selectedFundSourceId}
                onValueChange={setSelectedFundSourceId}
                disabled={isAdding || loading || loadingFundSources}
              >
                <SelectTrigger className="h-9 text-sm bg-white border border-gray-300 hover:border-gray-400 cursor-pointer">
                  <SelectValue placeholder="All Fund Sources" />
                </SelectTrigger>
                <SelectContent className="z-[999999]">
                  <SelectItem value="all">All Fund Sources</SelectItem>
                  {fundSources.map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>
                      {fs.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Plan Type</Label>
              <Select
                value={selectedPlanType}
                onValueChange={setSelectedPlanType}
                disabled={isAdding || loading}
              >
                <SelectTrigger className="h-9 text-sm bg-white border border-gray-300 hover:border-gray-400 cursor-pointer">
                  <SelectValue placeholder="All Plan Types" />
                </SelectTrigger>
                <SelectContent className="z-[999999]">
                  <SelectItem value="all">All Plan Types</SelectItem>
                  <SelectItem value="indicative">Indicative</SelectItem>
                  <SelectItem value="final">Final PPMP</SelectItem>
                  <SelectItem value="supplemental">Supplemental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 text-base">
              <p className="text-gray-600 font-medium mb-2">Adding to</p>
              <p className="text-gray-900 font-semibold text-lg">{displayApp?.appName}</p>
              <p className="text-gray-650 text-sm mt-1">Code: {displayApp?.appCode}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Available PPMPs
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({eligibleDisplayedPPMPs.length} eligible
                  {selectedPlanType !== 'all' ? ` of ${eligiblePPMPs.length} total` : ''})
                </span>
              </Label>
              {!loading && eligibleDisplayedPPMPs.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  disabled={isAdding}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium cursor-pointer"
                >
                  {isAllEligibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 font-medium">Loading PPMPs...</p>
              </div>
            ) : displayedPpmps.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2 max-h-64 overflow-y-auto">
                {displayedPpmps.map((ppmp) => {
                  const status = getPPMPStatus(ppmp)
                  const isChecked = selectedPPMPIds.has(ppmp.id) && status.isEligible

                  return (
                    <label
                      key={ppmp.id}
                      className={`flex items-start gap-3 p-3 rounded-md transition-colors border ${
                        !status.isEligible
                          ? 'opacity-60 bg-gray-50/70 border-gray-200 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-50/60 border-blue-200 cursor-pointer'
                          : 'hover:bg-gray-50 border-transparent cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePPMPSelection(ppmp.id)}
                        disabled={isAdding || !status.isEligible}
                        className={`mt-1 ${!status.isEligible ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <p className="font-semibold text-gray-900 text-base">{ppmp.ppmpNumber}</p>
                            {renderPlanTypeBadge(ppmp)}
                          </div>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badgeStyle}`}>
                            {status.badgeText}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {ppmp.officeName} · {ppmp.fiscalYearName || ppmp.fiscalYear} · {ppmp.PPMPItems?.length || 0} items
                        </p>
                        {status.reasonText && (
                          <p className="text-xs font-medium text-gray-500 mt-1 italic">
                            {status.reasonText}
                          </p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedPlanType !== 'all'
                  ? 'No PPMPs match your search or filter'
                  : 'No PPMPs available'}
              </div>
            )}
          </div>

          {!loading && selectedEligiblePPMPs.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4 text-base flex justify-between items-center">
                <div>
                  <p className="text-green-900 font-semibold text-lg">
                    {selectedEligiblePPMPs.length} eligible PPMP(s) selected
                  </p>
                  <p className="text-green-700 text-sm mt-0.5">
                    {selectedItemsCount} items will be added to this APP
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-6 border-t flex-shrink-0 px-6">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setSelectedPPMPIds(new Set())
              setSearchTerm('')
              setSelectedPlanType('all')
            }}
            disabled={isAdding || loading}
            className="pointer-events-auto cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPPMPs}
            disabled={isAdding || loading || selectedEligiblePPMPs.length === 0}
            className="pointer-events-auto cursor-pointer"
          >
            {isAdding
              ? 'Consolidating...'
              : selectedEligiblePPMPs.length > 0
              ? `Consolidate ${selectedEligiblePPMPs.length} PPMP(s)`
              : 'Consolidate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
