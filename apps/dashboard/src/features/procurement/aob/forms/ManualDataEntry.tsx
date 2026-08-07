/**
 * Manual Data Entry Component for Bid Matrix
 * Allows editing of unit prices with automatic calculation of totals
 * Includes quality score input and award criteria calculations
 */

import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { SupplierBid, LineItem } from '../types'
import { calculateTotalBid } from '../utils/bidCalculations'
import { calculateQualityToPriceRatio } from '../utils/awardCriteriaCalculations'

/**
 * Zod schema for bid data entry
 */
const bidDataSchema = z.object({
  unitBid: z.number().positive('Unit price must be greater than zero').optional(),
  qualityScore: z.number().min(0).max(100, 'Quality score must be between 0 and 100').optional(),
  remarks: z.string().max(500, 'Remarks must be 500 characters or less').optional(),
})

type BidDataFormValues = z.infer<typeof bidDataSchema>

interface ManualDataEntryProps {
  bid: SupplierBid
  lineItem: LineItem
  onSave?: (updatedBid: SupplierBid) => void
  isOpen?: boolean
  readOnly?: boolean
}

export function ManualDataEntry({
  bid,
  lineItem,
  onSave,
  isOpen = true,
  readOnly = false,
}: ManualDataEntryProps) {
  const form = useForm<BidDataFormValues>({
    resolver: zodResolver(bidDataSchema),
    mode: 'onChange',
    defaultValues: {
      unitBid: bid.unitBid ?? undefined,
      qualityScore: bid.qualityScore ?? undefined,
      remarks: bid.remarks ?? '',
    },
  })

  const unitBidValue = form.watch('unitBid')
  const qualityScoreValue = form.watch('qualityScore')

  // Calculate totals in real-time
  const calculatedTotalBid = useMemo(
    () => calculateTotalBid(lineItem.quantity, unitBidValue ?? null),
    [unitBidValue, lineItem.quantity]
  )

  const calculatedQPRatio = useMemo(
    () => calculateQualityToPriceRatio(qualityScoreValue ?? undefined, unitBidValue ?? undefined),
    [qualityScoreValue, unitBidValue]
  )

  const onSubmit = useCallback(
    (data: BidDataFormValues) => {
      const updatedBid: SupplierBid = {
        ...bid,
        unitBid: data.unitBid ?? null,
        totalBid: calculatedTotalBid ?? null,
        qualityScore: data.qualityScore ?? undefined,
        calculatedQualityPriceRatio: calculatedQPRatio,
        remarks: data.remarks || '',
      }
      onSave?.(updatedBid)
    },
    [bid, calculatedTotalBid, calculatedQPRatio, onSave]
  )

  if (!isOpen) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Enter Bid Data</CardTitle>
        <CardDescription>
          {bid.supplierName} - {lineItem.itemCode}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Information */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
              <div>
                <Label className="text-xs text-gray-600">Item</Label>
                <div className="font-medium text-sm">{lineItem.itemCode}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Quantity</Label>
                <div className="font-medium text-sm">{lineItem.quantity} {lineItem.unit}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Budget</Label>
                <div className="font-medium text-sm">
                  ₱{lineItem.approvedBudgetForContract?.toLocaleString()}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Category</Label>
                <div className="font-medium text-sm text-gray-700">{lineItem.category}</div>
              </div>
            </div>

            {/* Unit Price Input */}
            <FormField
              control={form.control}
              name="unitBid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (₱)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step={0.01}
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Price per unit of {lineItem.unit}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-calculated Total */}
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <Label className="text-xs text-gray-600">Total Bid (Calculated)</Label>
              <div className="font-bold text-lg text-blue-600 mt-1">
                {calculatedTotalBid
                  ? `₱${calculatedTotalBid.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : 'Enter unit price'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {unitBidValue ? `${unitBidValue} × ${lineItem.quantity} = ${calculatedTotalBid?.toLocaleString()}` : ''}
              </p>
            </div>

            {/* Budget Check */}
            {calculatedTotalBid &&
              lineItem.approvedBudgetForContract &&
              calculatedTotalBid > lineItem.approvedBudgetForContract && (
                <Alert variant="soft">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Total bid (₱{calculatedTotalBid.toLocaleString()}) exceeds approved budget
                    (₱{lineItem.approvedBudgetForContract.toLocaleString()})
                  </AlertDescription>
                </Alert>
              )}

            {/* Quality Score Input */}
            <FormField
              control={form.control}
              name="qualityScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality Score (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100}
                      step={1}
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Supplier quality rating for this item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quality-to-Price Ratio */}
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <Label className="text-xs text-gray-600">Quality-to-Price Ratio (LCRB)</Label>
              <div className="font-bold text-lg text-purple-600 mt-1">
                {calculatedQPRatio ? calculatedQPRatio.toFixed(2) : 'Enter quality score and price'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {qualityScoreValue && unitBidValue ? `${qualityScoreValue} ÷ ${unitBidValue} = ${calculatedQPRatio?.toFixed(2)}` : ''}
              </p>
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this bid..."
                      disabled={readOnly}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional notes about the bid submission
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            {!readOnly && (
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">Save Bid Data</Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
