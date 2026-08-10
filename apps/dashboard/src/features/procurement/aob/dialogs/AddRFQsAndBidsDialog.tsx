/**
 * Add RFQs & Bids Dialog
 * Allows users to link RFQs and import/generate supplier bids
 * Generates bid matrix from selected RFQs and supplier data
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MOCK_BID_MATRIX, MOCK_SUPPLIERS } from '../__mocks__/mockData'
import type { BidMatrix } from '../types/aobTypes'

// Mock RFQ list for selection
const MOCK_RFQS = [
  { id: 'rfq-001', number: 'RFQ-2024-001', description: 'Office Supplies & Equipment' },
  { id: 'rfq-002', number: 'RFQ-2024-002', description: 'IT Hardware & Software' },
  { id: 'rfq-003', number: 'RFQ-2024-003', description: 'Maintenance Services' },
]

interface AddRFQsAndBidsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aobId?: string
  onBidMatrixGenerated?: (bidMatrix: BidMatrix) => void
}

export function AddRFQsAndBidsDialog({
  open,
  onOpenChange,
  aobId,
  onBidMatrixGenerated,
}: AddRFQsAndBidsDialogProps) {
  const initialSelections: string[] = []
  const [selectedRFQs, setSelectedRFQs] = useState<string[]>(initialSelections)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  // Track if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(selectedRFQs) !== JSON.stringify(initialSelections)

  const handleRFQToggle = (rfqId: string) => {
    setSelectedRFQs((prev) =>
      prev.includes(rfqId) ? prev.filter((id) => id !== rfqId) : [...prev, rfqId]
    )
  }

  const handleSubmit = async () => {
    setApiError('')

    if (selectedRFQs.length === 0) {
      setApiError('Please select at least one RFQ')
      return
    }

    try {
      setIsProcessing(true)

      // Simulate API call to link RFQs and fetch supplier bids
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real scenario, this would:
      // 1. Call API to link RFQs to AOB
      // 2. Fetch supplier bids from API
      // 3. Generate bid matrix
      //
      // For now, we use mock bid matrix

      const generatedBidMatrix = {
        ...MOCK_BID_MATRIX,
        aobId: aobId || 'aob-001',
      }

      toast.success(
        `Successfully linked ${selectedRFQs.length} RFQ(s) and imported supplier bids`
      )

      onBidMatrixGenerated?.(generatedBidMatrix)
      setSelectedRFQs([])
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add RFQs and bids'
      setApiError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onOpenChange(false)
    }
  }

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false)
    setSelectedRFQs(initialSelections)
    onOpenChange(false)
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={handleClose}
        title="Add RFQs & Import Supplier Bids"
        description="Select RFQs to link and import supplier bids for evaluation"
        size="sm"
        showCloseButton
      >
        <div className="space-y-4">
          {apiError && (
            <Alert variant="soft">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* RFQs Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available RFQs</CardTitle>
              <CardDescription className="text-xs">
                Select RFQs to link to this AOB. Their line items will be imported.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_RFQS.map((rfq) => (
                <div key={rfq.id} className="flex items-start gap-3 p-3 rounded border">
                  <Checkbox
                    id={rfq.id}
                    checked={selectedRFQs.includes(rfq.id)}
                    onCheckedChange={() => handleRFQToggle(rfq.id)}
                    disabled={isProcessing}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={rfq.id}
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {rfq.number}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{rfq.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Supplier Bids Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    {MOCK_SUPPLIERS.length} Suppliers Ready
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    {selectedRFQs.length > 0
                      ? `${selectedRFQs.length} RFQ(s) selected with ${MOCK_SUPPLIERS.length} responsive supplier bids`
                      : 'Select RFQs to see supplier bid details'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || selectedRFQs.length === 0}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add RFQs & Bids
                </>
              )}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved RFQ selections. Do you want to discard these changes and close?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
