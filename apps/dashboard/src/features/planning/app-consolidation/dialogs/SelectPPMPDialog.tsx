import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
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
  const [ppmps, setPpmps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fundSources, setFundSources] = useState<any[]>([])
  const [selectedFundSourceId, setSelectedFundSourceId] = useState<string>('all')
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
          // Additional safety filter by Fiscal Year
          const fyFiltered = rawPpmps.filter((p: any) => {
            if (fyId && p.fiscalYearId && p.fiscalYearId.toLowerCase() !== fyId.toLowerCase()) return false
            const pYearStr = p.fiscalYearName || p.fiscalYear || p.fiscalYearYear
            if (fyYear && pYearStr && String(pYearStr) !== String(fyYear)) return false
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
  const getPPMPStatus = useCallback((ppmp: any) => {
    const isAlreadyInCurrentApp = currentApp?.ppmpIds?.includes(ppmp.id) ||
      currentApp?.appPpmps?.some((ap: any) => ap.ppmpId === ppmp.id)

    const isLinkedToOtherApp = Boolean(ppmp.consolidatedIntoId && ppmp.consolidatedIntoId !== currentApp?.id)

    const fyId = currentApp?.fiscalYearId
    const fyYear = currentApp?.fiscalYear
    const pYearStr = ppmp.fiscalYearName || ppmp.fiscalYear || ppmp.fiscalYearYear

    const isFiscalYearMismatch = Boolean(
      (fyId && ppmp.fiscalYearId && ppmp.fiscalYearId.toLowerCase() !== fyId.toLowerCase()) ||
      (fyYear && pYearStr && String(pYearStr) !== String(fyYear))
    )

    const isEligible = !isAlreadyInCurrentApp && !isLinkedToOtherApp && !isFiscalYearMismatch

    let badgeText = 'Available'
    let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300'
    let reasonText = ''

    if (isAlreadyInCurrentApp) {
      badgeText = 'Already Added'
      badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300'
      reasonText = 'Already part of the current APP'
    } else if (isLinkedToOtherApp) {
      badgeText = 'Already Linked'
      badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300'
      reasonText = 'Already linked to another APP'
    } else if (isFiscalYearMismatch) {
      badgeText = 'Fiscal Year Mismatch'
      badgeStyle = 'bg-red-100 text-red-800 border-red-300'
      reasonText = `Fiscal Year mismatch (${pYearStr || 'Unknown'} vs APP ${fyYear || ''})`
    }

    return {
      isAlreadyInCurrentApp,
      isLinkedToOtherApp,
      isFiscalYearMismatch,
      isEligible,
      badgeText,
      badgeStyle,
      reasonText,
    }
  }, [currentApp])

  // Filter eligible PPMPs from currently loaded list
  const eligiblePPMPs = useMemo(() => {
    return ppmps.filter((p) => getPPMPStatus(p).isEligible)
  }, [ppmps, getPPMPStatus])

  // Selected eligible PPMPs set
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
      const allEligibleSelected = eligiblePPMPs.length > 0 && eligiblePPMPs.every((p) => prev.has(p.id))
      const newSelected = new Set(prev)

      if (allEligibleSelected) {
        // Deselect all eligible
        eligiblePPMPs.forEach((p) => newSelected.delete(p.id))
      } else {
        // Select all eligible
        eligiblePPMPs.forEach((p) => newSelected.add(p.id))
      }
      return newSelected
    })
  }, [eligiblePPMPs])

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

        // Invalidate react-query cache to force all components using APP details to refresh
        queryClient.invalidateQueries({
          queryKey: [`/apps/${currentApp.id}`],
        })
        queryClient.invalidateQueries({
          queryKey: [getAPPDetailRequest.endpoint, currentApp.id],
        })
        queryClient.invalidateQueries({
          queryKey: ['/apps'],
        })

        toast.success(`${eligibleIdsToSubmit.length} PPMP(s) consolidated successfully`)
        setOpen(false)
        setSelectedPPMPIds(new Set())
        setSearchTerm('')
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
  const isAllEligibleSelected = eligiblePPMPs.length > 0 && eligiblePPMPs.every((p) => selectedPPMPIds.has(p.id))

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

          {/* Filter Dropdown */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Fund Source</Label>
            <Select value={selectedFundSourceId} onValueChange={setSelectedFundSourceId} disabled={isAdding || loading || loadingFundSources}>
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
                  ({eligiblePPMPs.length} eligible)
                </span>
              </Label>
              {!loading && eligiblePPMPs.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  disabled={isAdding}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium cursor-pointer"
                >
                  {isAllEligibleSelected ? 'Deselect All Eligible' : 'Select All Eligible'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 font-medium">Loading PPMPs...</p>
              </div>
            ) : ppmps.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2 max-h-64 overflow-y-auto">
                {ppmps.map((ppmp) => {
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
                          <p className="font-semibold text-gray-900 text-base">{ppmp.ppmpNumber}</p>
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
                {searchTerm ? 'No PPMPs match your search' : 'No PPMPs available'}
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
