/**
 * Select APP Dialog Component
 * 
 * Uses dialog + form pattern with Jotai atom state management and live API Fiscal Years
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAtom } from 'jotai'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SelectAPPForm, type SelectAppFormValues } from '../forms/SelectAPPForm'
import { selectAPPDialogOpenAtom, selectedAPRFiscalYearAtom } from '../atoms'
import { useFiscalYears } from '../handlers/hooks'
import type { ConsolidatedAPRItem } from '../types'

interface SelectAPPDialogProps {
  onSelectAPP: (
    appId: string,
    lineItemIds: string[],
    consolidatedItems: ConsolidatedAPRItem[],
    selectedApp?: any,
    selectedAppIds?: string[],
    selectedApps?: any[]
  ) => void
}

export function SelectAPPDialog({ onSelectAPP }: SelectAPPDialogProps) {
  const [open, setOpen] = useAtom(selectAPPDialogOpenAtom)
  const [selectedFiscalYear, setSelectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)
  const [isFormValid, setIsFormValid] = useState(false)
  const formId = 'select-app-form'

  // Fetch live fiscal years from backend API
  const { data: fiscalYearsResponse, isLoading: fiscalYearsLoading } = useFiscalYears({})

  const fiscalYears = useMemo(() => {
    if (!fiscalYearsResponse) return []
    if (Array.isArray(fiscalYearsResponse)) return fiscalYearsResponse
    if (Array.isArray((fiscalYearsResponse as any).data)) return (fiscalYearsResponse as any).data
    if (Array.isArray((fiscalYearsResponse as any).items)) return (fiscalYearsResponse as any).items
    return []
  }, [fiscalYearsResponse])

  // Automatically select the active fiscal year if not yet set
  useEffect(() => {
    if (fiscalYears.length > 0 && !selectedFiscalYear) {
      const activeFY = fiscalYears.find((fy: any) => fy.status === 'active') || fiscalYears[0]
      if (activeFY?.year) {
        setSelectedFiscalYear(activeFY.year)
      }
    }
  }, [fiscalYears, selectedFiscalYear, setSelectedFiscalYear])

  const selectedFYObj = useMemo(
    () => fiscalYears.find((fy: any) => fy.year === selectedFiscalYear),
    [fiscalYears, selectedFiscalYear]
  )

  const handleValidationChange = useCallback((valid: boolean) => {
    setIsFormValid((prev) => (prev !== valid ? valid : prev))
  }, [])

  const handleSubmit = (values: SelectAppFormValues) => {
    onSelectAPP(
      values.selectedAppId,
      values.selectedLineItemIds,
      values.consolidatedItems,
      values.selectedApp,
      values.selectedAppIds,
      values.selectedApps
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[95vh] flex flex-col" size="2xl">
        <DialogHeader>
          <DialogTitle>Create APR from APP</DialogTitle>
          <DialogDescription>
            Select an approved Annual Procurement Plan and the line items to include in this APR
          </DialogDescription>
        </DialogHeader>

        {/* Fiscal Year Selector — API integrated */}
        <div className="px-6 py-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-blue-900">Select Fiscal Year</label>
            {fiscalYearsLoading && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading fiscal years...
              </span>
            )}
          </div>
          <Select
            value={selectedFiscalYear ? selectedFiscalYear.toString() : ''}
            onValueChange={(val) => setSelectedFiscalYear(parseInt(val, 10))}
            disabled={fiscalYearsLoading || fiscalYears.length === 0}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select fiscal year" />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears.length > 0 ? (
                fiscalYears.map((fy: any) => (
                  <SelectItem key={fy.id || fy.year} value={fy.year.toString()}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>FY {fy.year}</span>
                      {fy.status && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 h-4 capitalize ${
                            fy.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : 'bg-gray-50 text-gray-600 border-gray-300'
                          }`}
                        >
                          {fy.status}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={selectedFiscalYear ? selectedFiscalYear.toString() : ''}>
                  FY {selectedFiscalYear || 2026}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto pr-6">
          <SelectAPPForm
            formId={formId}
            onSubmit={handleSubmit}
            onValidationChange={handleValidationChange}
            fiscalYear={selectedFiscalYear}
            fiscalYearId={selectedFYObj?.id}
          />
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={!isFormValid}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Proceed with Selected Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
