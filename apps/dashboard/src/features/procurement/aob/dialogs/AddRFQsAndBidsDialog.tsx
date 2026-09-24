import { useState, useMemo } from 'react'
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
import { AlertCircle, CheckCircle, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { BidMatrix } from '../types/aobTypes'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { getRFQListRequest } from '../handlers/getRFQListRequest'
import { linkRFQRequest } from '../handlers/linkRFQRequest'
import { getAOBDetailRequest } from '../handlers/getAOBDetailRequest'
import { getBidMatrixRequest } from '../handlers/getBidMatrixRequest'

const useRFQList = createQueryHookFromTemplate(getRFQListRequest)
const useLinkRFQ = createMutationHookFromTemplate(linkRFQRequest)

interface AddRFQsAndBidsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aobId?: string
  onBidMatrixGenerated?: (bidMatrix: BidMatrix) => void
  currentlyLinkedRfqIds?: string[]
}

export function AddRFQsAndBidsDialog({
  open,
  onOpenChange,
  aobId,
  onBidMatrixGenerated,
  currentlyLinkedRfqIds = [],
}: AddRFQsAndBidsDialogProps) {
  const initialSelections: string[] = []
  const [selectedRFQs, setSelectedRFQs] = useState<string[]>(initialSelections)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const queryClient = useQueryClient()
  const { data: rfqsResponse, isLoading: isLoadingRFQs } = useRFQList({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 50, status: 'Approved' },
  })
  const { mutateAsync: linkRFQs } = useLinkRFQ()

  const availableRfqs = useMemo(() => {
    return (rfqsResponse?.data || []).filter(
      (r) => !r.status || r.status.toLowerCase() === 'approved'
    )
  }, [rfqsResponse])

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

    if (!aobId) {
      setApiError('AOB ID is required')
      return
    }

    try {
      setIsProcessing(true)

      await linkRFQs({
        pathParams: { id: aobId },
        payload: {
          rfqIds: selectedRFQs,
        },
      })

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => typeof k === 'string' && k.includes(aobId)
          ),
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}`],
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}/matrix`],
      })

      toast.success(
        `Successfully linked ${selectedRFQs.length} RFQ(s)`
      )

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
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {isLoadingRFQs ? (
                <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading available RFQs...
                </div>
              ) : availableRfqs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No available RFQs found</p>
              ) : (
                availableRfqs.map((rfq) => {
                  const isAlreadyLinked = currentlyLinkedRfqIds.includes(rfq.id)
                  return (
                    <div
                      key={rfq.id}
                      className={`flex items-start gap-3 p-3 rounded border transition-colors ${
                        isAlreadyLinked ? 'bg-gray-50 border-gray-200 opacity-75' : ''
                      }`}
                    >
                      <Checkbox
                        id={rfq.id}
                        checked={isAlreadyLinked || selectedRFQs.includes(rfq.id)}
                        onCheckedChange={() => !isAlreadyLinked && handleRFQToggle(rfq.id)}
                        disabled={isProcessing || isAlreadyLinked}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={rfq.id}
                            className={`text-sm font-medium ${isAlreadyLinked ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                          >
                            {rfq.rfqNumber}
                          </Label>
                          {isAlreadyLinked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                              Already Linked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{rfq.description || rfq.tracingNumber || '-'}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Selection Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    {selectedRFQs.length} RFQ(s) Selected
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    {selectedRFQs.length > 0
                      ? 'Linked RFQs and their supplier bids will be compiled into the evaluation matrix'
                      : 'Select one or more RFQs to link to this Abstract of Bids'}
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
