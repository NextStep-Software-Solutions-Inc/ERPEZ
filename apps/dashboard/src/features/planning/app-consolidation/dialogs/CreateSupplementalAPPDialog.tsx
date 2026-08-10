/**
 * CreateSupplementalAPPDialog - Task 3.1 (Main Supplemental APP Dialog)
 * Multi-step wizard for creating supplemental APPs
 * Steps:
 * 1. Metadata (Quarter, Reference/Memo, Approval Doc)
 * 2. Amended PPMP Selection
 * 3. Delta Review
 * 4. Confirmation
 */

import { useState, useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

import { SupplementalAPPMetadataForm, type SupplementalMetadataFormValues } from '../forms/SupplementalAPPMetadataForm'
import { AmendedPPMPSelector } from '../components/AmendedPPMPSelector'
import { DialogStepIndicator } from '../components/DialogStepIndicator'
import { calculateDeltaTotals } from '../utils/deltaCalculator'
import { formatCurrency } from '../utils/appExportFormatter'

import type { AppMaster, DeltaItem } from '../types'

interface CreateSupplementalAPPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterApp: AppMaster | null
}

type DialogStep = 'metadata' | 'ppmp-selection' | 'delta-review' | 'confirmation'

export function CreateSupplementalAPPDialog({
  open,
  onOpenChange,
  masterApp,
}: CreateSupplementalAPPDialogProps) {
  const [currentStep, setCurrentStep] = useState<DialogStep>('metadata')
  const [isLoading, setIsLoading] = useState(false)

  // Metadata from step 1
  const [metadata, setMetadata] = useState<SupplementalMetadataFormValues | null>(null)

  // Delta items from step 2
  const [deltaItems, setDeltaItems] = useState<DeltaItem[]>([])
  const [selectedAmendedPPMPIds, setSelectedAmendedPPMPIds] = useState<string[]>([])

  const deltaTotals = useMemo(() => calculateDeltaTotals(deltaItems), [deltaItems])

  // Mock amended PPMPs (in real app, fetch from API)
  const mockAmendedPPMPs = useMemo(
    () => [
      {
        ppmpId: 'ppmp-2024-001-v1.1',
        ppmpNumber: 'PPMP-2024-001',
        fiscalYear: 2024,
        version: '1.1',
        isAmended: true,
        originalVersion: '1.0',
        items: [
          {
            id: 'item-1',
            code: 'ITEM-001',
            description: 'Laptops',
            unit: 'unit',
            quantity: 12, // Amended from 10
            unitCost: 50000,
            totalAmount: 600000,
            modeOfProcurement: 'Competitive Bidding',
            fundSource: 'General Fund',
            itemCategory: 'IT Equipment',
            allotmentClass: 'CO',
          },
          {
            id: 'item-2',
            code: 'ITEM-002',
            description: 'Printers',
            unit: 'unit',
            quantity: 5, // New item
            unitCost: 20000,
            totalAmount: 100000,
            modeOfProcurement: 'Competitive Bidding',
            fundSource: 'General Fund',
            itemCategory: 'IT Equipment',
            allotmentClass: 'CO',
          },
        ],
      },
      {
        ppmpId: 'ppmp-2024-002-v1.1',
        ppmpNumber: 'PPMP-2024-002',
        fiscalYear: 2024,
        version: '1.1',
        isAmended: true,
        originalVersion: '1.0',
        items: [
          {
            id: 'item-3',
            code: 'ITEM-003',
            description: 'Office Chairs',
            unit: 'unit',
            quantity: 20, // Amended from 15
            unitCost: 5000,
            totalAmount: 100000,
            modeOfProcurement: 'Price Quotation',
            fundSource: 'General Fund',
            itemCategory: 'Office Furniture',
            allotmentClass: 'MOOE',
          },
        ],
      },
    ],
    []
  )

  // Handle metadata form submission
  const handleMetadataSubmit = useCallback(async (values: SupplementalMetadataFormValues) => {
    setMetadata(values)
    setCurrentStep('ppmp-selection')
  }, [])

  // Handle delta items calculated
  const handleDeltaItemsCalculated = useCallback((items: DeltaItem[], ppmpIds: string[]) => {
    setDeltaItems(items)
    setSelectedAmendedPPMPIds(ppmpIds)
    setCurrentStep('delta-review')
  }, [])

  // Handle creation confirmation
  const handleCreateSupplemental = useCallback(async () => {
    if (!masterApp || !metadata || deltaItems.length === 0) {
      toast.error('Missing required information')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to create supplemental APP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real app:
      // 1. Calculate next supplemental number
      // 2. Generate supplemental APP name
      // 3. Create SupplementalAPP record with delta items
      // 4. Update master APP to link supplemental
      // 5. Trigger approval workflow

      toast.success(`Supplemental APP created successfully for Q${metadata.quarter}`)
      onOpenChange(false)

      // Reset form
      setCurrentStep('metadata')
      setMetadata(null)
      setDeltaItems([])
      setSelectedAmendedPPMPIds([])
    } catch (error) {
      console.error('Failed to create supplemental APP:', error)
      toast.error('Failed to create supplemental APP')
    } finally {
      setIsLoading(false)
    }
  }, [masterApp, metadata, deltaItems, onOpenChange])

  if (!masterApp) return null

  const stepLabels = {
    metadata: 'Metadata',
    'ppmp-selection': 'Select PPMPs',
    'delta-review': 'Review Delta',
    confirmation: 'Confirm',
  }

  const currentStepNumber = Object.keys(stepLabels).indexOf(currentStep) + 1
  const totalSteps = Object.keys(stepLabels).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col z-[99999]">
        <DialogHeader>
          <DialogStepIndicator
            currentStep={currentStepNumber}
            totalSteps={totalSteps}
            stepName={stepLabels[currentStep]}
            className="mb-2"
          />
          <DialogTitle className="text-2xl">Create Supplemental APP</DialogTitle>
          <DialogDescription>
            Master APP: {masterApp.appName} (FY {masterApp.fiscalYear})
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Metadata */}
        {currentStep === 'metadata' && (
          <div className="flex-1 overflow-y-auto space-y-4 px-6">
            <SupplementalAPPMetadataForm
              onSubmit={handleMetadataSubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Step 2: PPMP Selection */}
        {currentStep === 'ppmp-selection' && (
          <div className="flex-1 overflow-y-auto space-y-4 px-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-900">
                  <strong>Quarter Selected:</strong> {metadata?.quarter || 'N/A'}
                </p>
                {metadata?.referenceMemoNo && (
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Reference:</strong> {metadata.referenceMemoNo}
                  </p>
                )}
              </CardContent>
            </Card>

            <AmendedPPMPSelector
              amendedPPMPs={mockAmendedPPMPs}
              onDeltaItemsCalculated={handleDeltaItemsCalculated}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Step 3: Delta Review */}
        {currentStep === 'delta-review' && (
          <div className="flex-1 overflow-y-auto space-y-4 px-6">
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>Delta Extraction Complete:</strong> {deltaItems.length} items ready to be added to the supplemental APP. Review before confirming.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="font-semibold text-base">Delta Items to be Added:</p>
              <div className="border border-gray-200 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                {deltaItems.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-orange-400 pl-3 py-2">
                    <p className="font-semibold text-gray-900">{item.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                      <div>
                        {item.isNewItem ? (
                          <span className="text-green-700 font-medium">New: {item.deltaQuantity} {item.unit}</span>
                        ) : (
                          <span className="text-orange-700 font-medium">
                            Additional: {item.deltaQuantity} {item.unit} (orig: {item.originalQuantity})
                          </span>
                        )}
                      </div>
                      <div className="text-right font-semibold">{formatCurrency(item.totalAmount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-semibold">{deltaTotals.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Items:</span>
                    <span className="font-semibold">{deltaTotals.newItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amended Items:</span>
                    <span className="font-semibold">{deltaTotals.amendedItems}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(deltaTotals.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Navigation */}
        <DialogFooter className="flex justify-between gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 'metadata') {
                onOpenChange(false)
              } else if (currentStep === 'ppmp-selection') {
                setCurrentStep('metadata')
              } else if (currentStep === 'delta-review') {
                setCurrentStep('ppmp-selection')
              }
            }}
            disabled={isLoading}
          >
            Back
          </Button>

          {currentStep === 'delta-review' && (
            <Button
              onClick={handleCreateSupplemental}
              disabled={isLoading || deltaItems.length === 0}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Supplemental APP'
              )}
            </Button>
          )}

          {currentStep !== 'delta-review' && (
            <Button
              onClick={() => {
                if (currentStep === 'ppmp-selection' && deltaItems.length > 0) {
                  setCurrentStep('delta-review')
                }
              }}
              disabled={
                isLoading ||
                (currentStep === 'ppmp-selection' && deltaItems.length === 0)
              }
            >
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
