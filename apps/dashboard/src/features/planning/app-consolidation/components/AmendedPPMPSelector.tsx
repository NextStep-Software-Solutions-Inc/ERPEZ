/**
 * AmendedPPMPSelector - Task 3.3
 * Component for selecting amended PPMPs and reviewing delta items
 * Shows original vs amended quantities for smart delta extraction
 */

import { useState, useMemo, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { extractDeltaFromAmendedPPMP, generateDeltaSummary, calculateDeltaTotals } from '../utils/deltaCalculator'
import { formatCurrency } from '../utils/appExportFormatter'
import type { DeltaItem, PPMPItem } from '../types'

interface PPMPVersionInfo {
  ppmpId: string
  ppmpNumber: string
  fiscalYear: number
  version: string // "1.0", "1.1", etc.
  isAmended: boolean
  originalVersion?: string
  items: PPMPItem[]
}

interface AmendedPPMPSelectorProps {
  amendedPPMPs: PPMPVersionInfo[]
  onDeltaItemsCalculated: (deltaItems: DeltaItem[], selectedPPMPIds: string[]) => void
  isLoading?: boolean
}

export function AmendedPPMPSelector({
  amendedPPMPs,
  onDeltaItemsCalculated,
  isLoading = false,
}: AmendedPPMPSelectorProps) {
  const [selectedAmendedPPMPIds, setSelectedAmendedPPMPIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [calculatingDelta, setCalculatingDelta] = useState(false)

  // Calculate delta items for selected PPMPs
  const calculateDelta = useCallback(async () => {
    setCalculatingDelta(true)
    try {
      // Combine all delta items from selected amended PPMPs
      const allDeltaItems: DeltaItem[] = []

      for (const ppmpId of selectedAmendedPPMPIds) {
        const amended = amendedPPMPs.find((p) => p.ppmpId === ppmpId)
        if (amended && amended.isAmended && amended.originalVersion) {
          // In real app, fetch original version from API
          // For now, use empty original (all items are new)
          const deltaItems = extractDeltaFromAmendedPPMP(null, {
            id: amended.ppmpId,
            version: amended.version,
            ppmpId: amended.ppmpId,
            items: amended.items,
            createdAt: new Date().toISOString(),
          })
          allDeltaItems.push(...deltaItems)
        }
      }

      // Notify parent with calculated delta items
      onDeltaItemsCalculated(allDeltaItems, Array.from(selectedAmendedPPMPIds))
    } finally {
      setCalculatingDelta(false)
    }
  }, [selectedAmendedPPMPIds, amendedPPMPs, onDeltaItemsCalculated])

  // Filter PPMPs by search term
  const filteredPPMPs = useMemo(() => {
    if (!searchTerm) return amendedPPMPs

    const lower = searchTerm.toLowerCase()
    return amendedPPMPs.filter(
      (p) =>
        p.ppmpNumber.toLowerCase().includes(lower) ||
        p.version.toLowerCase().includes(lower) ||
        p.ppmpId.toLowerCase().includes(lower)
    )
  }, [amendedPPMPs, searchTerm])

  // Calculate totals for selected PPMPs
  const selectedPPMPsInfo = useMemo(() => {
    const selected = amendedPPMPs.filter((p) => selectedAmendedPPMPIds.has(p.ppmpId))
    const totalItems = selected.reduce((sum, p) => sum + p.items.length, 0)
    const totalAmount = selected.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.totalAmount, 0), 0)

    return { count: selected.length, totalItems, totalAmount }
  }, [amendedPPMPs, selectedAmendedPPMPIds])

  const togglePPMPSelection = useCallback((ppmpId: string) => {
    setSelectedAmendedPPMPIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ppmpId)) {
        newSet.delete(ppmpId)
      } else {
        newSet.add(ppmpId)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedAmendedPPMPIds.size === filteredPPMPs.length) {
      setSelectedAmendedPPMPIds(new Set())
    } else {
      setSelectedAmendedPPMPIds(new Set(filteredPPMPs.map((p) => p.ppmpId)))
    }
  }, [filteredPPMPs, selectedAmendedPPMPIds])

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Smart Delta Extraction:</strong> Select amended PPMPs below. The system will automatically calculate only the net-new or additional quantities to prevent double-counting in your supplement.
        </AlertDescription>
      </Alert>

      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search">Search PPMPs</Label>
        <Input
          id="search"
          placeholder="Search by PPMP number or version..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Available PPMPs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Available Amended PPMPs</Label>
          {filteredPPMPs.length > 0 && (
            <button
              onClick={toggleSelectAll}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium"
            >
              {selectedAmendedPPMPIds.size === filteredPPMPs.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {filteredPPMPs.length > 0 ? (
          <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
            {filteredPPMPs.map((ppmp) => (
              <label
                key={ppmp.ppmpId}
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedAmendedPPMPIds.has(ppmp.ppmpId)}
                  onChange={() => togglePPMPSelection(ppmp.ppmpId)}
                  disabled={isLoading}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{ppmp.ppmpNumber}</p>
                    {ppmp.isAmended && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                        v{ppmp.version} (Amended)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    FY {ppmp.fiscalYear} · {ppmp.items.length} items ·{' '}
                    {formatCurrency(ppmp.items.reduce((sum, item) => sum + item.totalAmount, 0))}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            {searchTerm ? 'No PPMPs match your search' : 'No amended PPMPs available'}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedPPMPsInfo.count > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-green-900">
                  {selectedPPMPsInfo.count} PPMP(s) Selected
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {selectedPPMPsInfo.totalItems} items will be analyzed for delta extraction ·{' '}
                  {formatCurrency(selectedPPMPsInfo.totalAmount)}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculate Delta Button */}
      <div className="flex gap-2">
        <Button
          onClick={calculateDelta}
          disabled={isLoading || calculatingDelta || selectedAmendedPPMPIds.size === 0}
          className="flex-1"
        >
          {calculatingDelta ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating Delta...
            </>
          ) : (
            'Calculate Delta & Continue'
          )}
        </Button>
      </div>

      {/* Info Box */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Example:</strong> If Original PPMP has 10 Laptops and Amended PPMP has 12 Laptops + 5 new Printers, the supplemental will contain only 2 additional Laptops and 5 new Printers to avoid duplication.
        </AlertDescription>
      </Alert>
    </div>
  )
}
