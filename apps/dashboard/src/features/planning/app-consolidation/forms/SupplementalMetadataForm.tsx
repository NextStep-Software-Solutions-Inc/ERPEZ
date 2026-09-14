import { useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  formatSupplementalName,
  generateSupplementalCode,
  getNextSupplementalNumber,
} from '../handlers/calculateDeltaItems'
import type { AppMaster, DeltaItem } from '../types'

interface SupplementalMetadataFormProps {
  originalApp: AppMaster
  deltaItems: DeltaItem[]
  totalDeltaAmount: number
  onMetadataChange: (metadata: {
    supplementalName: string
    supplementalCode: string
    supplementalNumber: number
  }) => void
}

/**
 * SupplementalMetadataForm Component
 *
 * Displays and manages sequential naming for supplemental APPs
 * Auto-generates:
 * - Sequential number (1, 2, 3, etc.)
 * - Supplemental name: "Supplemental Annual Procurement Plan No. X for FY YYYY"
 * - Supplemental code: "APP-YYYY-XXX-S1"
 *
 * This is step 2 (after delta-items step) in the Supplemental APP workflow
 */
export function SupplementalMetadataForm({
  originalApp,
  deltaItems,
  totalDeltaAmount,
  onMetadataChange,
}: SupplementalMetadataFormProps) {
  // Mock: Get existing supplementals (in real app, fetch from API)
  // For now, assume this is the first supplemental
  const supplementalNumber = useMemo(() => {
    return getNextSupplementalNumber([])
  }, [])

  const metadata = useMemo(
    () => ({
      supplementalNumber,
      supplementalName: formatSupplementalName(supplementalNumber, originalApp.fiscalYear),
      supplementalCode: generateSupplementalCode(originalApp.appCode, supplementalNumber),
    }),
    [supplementalNumber, originalApp.fiscalYear, originalApp.appCode],
  )

  // Notify parent of metadata changes
  const handleMetadataReady = useCallback(() => {
    onMetadataChange(metadata)
  }, [metadata, onMetadataChange])

  // Notify on mount
  React.useEffect(() => {
    handleMetadataReady()
  }, [handleMetadataReady])

  return (
    <div className="space-y-4">
      {/* Header Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Supplemental APP Details</CardTitle>
          <CardDescription>
            This supplemental will be linked to {originalApp.appCode}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sequential Naming */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sequential Naming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Supplemental Number</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-2">
                No. {metadata.supplementalNumber}
              </Badge>
              <p className="text-xs text-gray-600">
                Auto-incremented from existing supplementals for this APP
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Supplemental Name</label>
            <Input
              type="text"
              value={metadata.supplementalName}
              disabled
              className="bg-gray-50 font-medium"
            />
            <p className="text-xs text-gray-600">
              Format: "Supplemental Annual Procurement Plan No. X for FY YYYY"
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Supplemental Code</label>
            <Input
              type="text"
              value={metadata.supplementalCode}
              disabled
              className="bg-gray-50 font-medium"
            />
            <p className="text-xs text-gray-600">
              Format: Original APP Code + "-S" + Sequential Number
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delta Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delta Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Total Delta Items:</span>
            <span className="font-medium">{deltaItems.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">New Items Added:</span>
            <span className="font-medium">{deltaItems.filter((d) => d.isNewItem).length}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-700">Items Modified:</span>
            <span className="font-medium">{deltaItems.filter((d) => !d.isNewItem).length}</span>
          </div>
          <div className="flex justify-between py-2 bg-green-50 px-3 rounded">
            <span className="text-gray-700 font-semibold">Total Delta Budget:</span>
            <span className="font-bold text-green-700">
              ₱{totalDeltaAmount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Original APP Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="text-amber-700">
              <span className="font-semibold">Original APP:</span> {originalApp.appCode} (FY{' '}
              {originalApp.fiscalYear})
            </p>
            <p className="text-amber-600 text-xs">
              This supplemental will be marked as linked to the original APP and cannot be
              modified after creation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Fix: Add React import for useEffect
import React from 'react'
