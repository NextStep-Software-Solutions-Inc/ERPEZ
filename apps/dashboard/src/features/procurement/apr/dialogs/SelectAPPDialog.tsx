/**
 * Select APP Dialog Component
 * 
 * Uses dialog + form pattern with Jotai atom state management
 * Max 50 lines - clean separation of concerns
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { CheckCircle2 } from 'lucide-react'
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
import { SelectAPPForm, type SelectAppFormValues } from '../forms/SelectAPPForm'
import { selectAPPDialogOpenAtom, selectedAPRFiscalYearAtom } from '../atoms'
import type { ConsolidatedAPRItem } from '../types'

interface SelectAPPDialogProps {
  onSelectAPP: (appId: string, lineItemIds: string[], consolidatedItems: ConsolidatedAPRItem[]) => void
}

export function SelectAPPDialog({ onSelectAPP }: SelectAPPDialogProps) {
  const [open, setOpen] = useAtom(selectAPPDialogOpenAtom)
  const [selectedFiscalYear, setSelectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)
  const [isFormValid, setIsFormValid] = useState(false)
  const formId = 'select-app-form'

  const handleSubmit = (values: SelectAppFormValues) => {
    onSelectAPP(values.selectedAppId, values.selectedLineItemIds, values.consolidatedItems)
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

        {/* Fiscal Year Selector */}
        <div className="px-6 py-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
          <label className="text-sm font-medium text-blue-900">Select Fiscal Year</label>
          <Select value={selectedFiscalYear.toString()} onValueChange={(val) => setSelectedFiscalYear(parseInt(val))}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select fiscal year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i
                return (
                  <SelectItem key={year} value={year.toString()}>
                    FY {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto pr-6">
          <SelectAPPForm
            formId={formId}
            onSubmit={handleSubmit}
            onValidationChange={setIsFormValid}
            fiscalYear={selectedFiscalYear}
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
