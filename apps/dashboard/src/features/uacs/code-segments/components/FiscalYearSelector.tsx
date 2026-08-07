import { useState } from 'react'
import { useAtom } from 'jotai'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Trash2, AlertTriangle } from 'lucide-react'
import { fiscalYearAtom, selectedCodesAtom, batchDeactivateLoadingAtom } from '../atoms/fiscalYearAtom'
import { showInactiveCodesAtom } from '../atoms/showInactiveCodesAtom'
import { toast } from 'sonner'

/**
 * Fiscal Year Selector Component
 * Allows users to select a fiscal year and filter codes accordingly
 * Also provides batch deactivate functionality for selected codes
 */
export function FiscalYearSelector() {
  const [selectedFY, setSelectedFY] = useAtom(fiscalYearAtom)
  const [showInactive, setShowInactive] = useAtom(showInactiveCodesAtom)
  const [selectedCodes] = useAtom(selectedCodesAtom)
  const [, setBatchDeactivateLoading] = useAtom(batchDeactivateLoadingAtom)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showFiscalYearChangeDialog, setShowFiscalYearChangeDialog] = useState(false)
  const [pendingFiscalYear, setPendingFiscalYear] = useState<number | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const handleFiscalYearChange = (newYear: string) => {
    const newYearNum = parseInt(newYear)
    if (newYearNum !== selectedFY) {
      setPendingFiscalYear(newYearNum)
      setShowFiscalYearChangeDialog(true)
    }
  }

  const confirmFiscalYearChange = () => {
    if (pendingFiscalYear !== null) {
      setSelectedFY(pendingFiscalYear)
      setPendingFiscalYear(null)
      setShowFiscalYearChangeDialog(false)
      toast.success(`Fiscal year changed to FY ${pendingFiscalYear}`)
    }
  }

  const handleBatchDeactivate = async () => {
    if (selectedCodes.size === 0) {
      toast.error('No codes selected')
      return
    }

    setBatchDeactivateLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      toast.success(
        `${selectedCodes.size} code(s) deactivated for FY ${selectedFY}`
      )
      setShowDeactivateDialog(false)
    } catch (error) {
      toast.error('Failed to deactivate codes')
      console.error(error)
    } finally {
      setBatchDeactivateLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Fiscal Year:</label>
        </div>
        
        <Select value={selectedFY.toString()} onValueChange={handleFiscalYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-inactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="show-inactive" className="text-sm text-gray-700">
            Show Inactive Codes
          </label>
        </div>

        {selectedCodes.size > 0 && (
          <>
            <div className="ml-auto text-sm text-gray-600">
              {selectedCodes.size} code(s) selected
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeactivateDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deactivate Selected for FY {selectedFY}
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={showFiscalYearChangeDialog} onOpenChange={setShowFiscalYearChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <AlertDialogTitle>Change Fiscal Year?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Changing the fiscal year will affect all UACS codes and their related budget records.
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 space-y-2">
                <p><strong>Current Fiscal Year:</strong> FY {selectedFY}</p>
                <p><strong>New Fiscal Year:</strong> FY {pendingFiscalYear}</p>
                <p className="mt-2">This change will:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Filter all displayed codes to the new fiscal year</li>
                  <li>Reset any unsaved changes for the current fiscal year</li>
                  <li>Show codes only for the selected fiscal year</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFiscalYear(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFiscalYearChange}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Change to FY {pendingFiscalYear}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <AlertDialogTitle>Deactivate Codes for FY {selectedFY}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You are about to deactivate {selectedCodes.size} code(s) for fiscal year {selectedFY}.
              This action will mark these codes as inactive for budget planning purposes.
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <strong>Note:</strong> This will affect all budget records using these codes in FY {selectedFY}.
                Consider informing your team before proceeding.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDeactivate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
