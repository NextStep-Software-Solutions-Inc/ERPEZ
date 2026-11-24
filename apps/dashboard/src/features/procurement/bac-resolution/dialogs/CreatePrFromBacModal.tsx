import { useState, useMemo } from 'react'
import { CheckCircle, Building2, Wallet, Tag, ArrowRight, Plus, Trash2, AlertTriangle, ExternalLink } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import type { BacResolution } from '../types'
import { usePurchaseRequestStore } from '../../purchase-requests-pr/store/purchaseRequestStore'
import type { PurchaseRequest, PRItem } from '../../purchase-requests-pr/types'

interface CreatePrFromBacModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolution: BacResolution | null
  onPrCreated?: (prNumber: string) => void
}

interface LineItemRow {
  id: string
  description: string
  unitOfMeasure: string
  quantity: number
  unitPrice: number
}

export function CreatePrFromBacModal({
  open,
  onOpenChange,
  resolution,
  onPrCreated,
}: CreatePrFromBacModalProps) {
  if (!resolution) return null

  const context = resolution.procurementProjectContext
  const approvedAbc = context?.abc || resolution.totalAmount || 0

  const [prNumber, setPrNumber] = useState(
    `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [purpose, setPurpose] = useState(
    context?.projectTitle || resolution.description
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Line items entry state
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    {
      id: 'item-1',
      description: context?.projectTitle || resolution.description || 'Procurement Line Item',
      unitOfMeasure: 'lot',
      quantity: 1,
      unitPrice: approvedAbc,
    },
  ])

  const totalLineItemsCost = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
  }, [lineItems])

  const isExceedingAbc = totalLineItemsCost > approvedAbc

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        unitOfMeasure: 'unit',
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      toast.error('At least one line item is required.')
      return
    }
    setLineItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleUpdateLineItem = (id: string, field: keyof LineItemRow, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleCreatePr = async () => {
    if (isExceedingAbc) {
      toast.error('Cannot create PR: Total line items cost exceeds approved ABC.')
      return
    }

    if (!purpose.trim()) {
      toast.error('Please enter a PR Purpose.')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))

      const prItems: PRItem[] = lineItems.map((item, idx) => ({
        id: `pr-item-${Date.now()}-${idx}`,
        itemId: `item-${idx + 1}`,
        itemName: item.description || 'Line Item',
        category: 'Procurement Package',
        quantity: Number(item.quantity) || 1,
        unitOfMeasure: item.unitOfMeasure || 'unit',
        unitPrice: Number(item.unitPrice) || 0,
        totalAmount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        source: 'bac',
      }))

      const createdPR: PurchaseRequest = {
        id: `pr-bac-${Date.now()}`,
        type: 'non-cse',
        status: 'approved',
        approvalOrigin: 'APPROVED_VIA_BAC',
        bacResolutionNumber: resolution.bacResolutionNumber,
        modeOfProcurement: context?.modeOfProcurement || 'Competitive Bidding',
        officeCode: 'OFF-01',
        officeName: context?.officeName || 'ICT Office',
        headerDetails: {
          date: new Date().toISOString().split('T')[0],
          prNumber,
          description: purpose,
          purpose,
          officeName: context?.officeName || 'ICT Office',
          appItemId: resolution.appItemId || undefined,
          bacResolutionId: resolution.id,
          bacResolutionNumber: resolution.bacResolutionNumber,
          modeOfProcurement: context?.modeOfProcurement || 'Competitive Bidding',
          sourceType: resolution.sourceType || 'APP_ITEM',
        },
        items: prItems,
        totalAmount: totalLineItemsCost,
        createdBy: 'BAC Procurement Unit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to Purchase Request Zustand store
      usePurchaseRequestStore.getState().addPurchaseRequest(createdPR)

      // Mark BAC Resolution as linked
      resolution.isPrCreated = true
      resolution.createdPrNumber = prNumber

      onPrCreated?.(prNumber)

      toast.success(
        `Purchase Request ${prNumber} created and marked Approved via BAC Resolution!`,
        {
          action: {
            label: 'View Created PR',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/v2/manage-prs'
              }
            },
          },
          duration: 7000,
        }
      )

      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to create Purchase Request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Create Purchase Request (PR) from Approved BAC Resolution"
      description="Generate downstream Purchase Request (PR) pre-filled with authoritative Procurement Project details and line item quantities."
      size="2xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                if (typeof window !== 'undefined') {
                  window.location.href = '/v2/manage-prs'
                }
              }}
              className="gap-1.5 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Go to PR Workspace
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePr}
              disabled={isSubmitting || isExceedingAbc}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating PR...' : 'Generate Purchase Request'}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 py-2">
        {/* Origin Flow Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white font-semibold">Path A Workflow</Badge>
            <span className="font-bold">{resolution.bacResolutionNumber}</span>
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
            <span>Downstream Purchase Request (PR)</span>
          </div>

          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold">
            Status: Approved via BAC
          </Badge>
        </div>

        {/* Read-Only Prefilled Procurement Project Card */}
        <div className="rounded-lg border border-default-200 bg-default-50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-default-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-default-700">
              Source Procurement Project Context
            </span>
            <Badge variant="outline" className="bg-white text-default-700 border-default-300">
              Authoritative Source
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Implementing Unit:
              </span>
              <p className="font-semibold text-default-900 mt-0.5">
                {context?.officeName || 'ICT Office'}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-blue-600" /> Mode of Procurement:
              </span>
              <p className="font-semibold text-default-900 mt-0.5">
                {context?.modeOfProcurement || 'Competitive Bidding'}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Source of Fund:
              </span>
              <p className="font-semibold text-default-900 mt-0.5">
                {context?.sourceOfFund || 'GAA'}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Approved Budget (ABC Cap):</span>
              <p className="font-extrabold text-sm text-emerald-700 mt-0.5">
                ₱{approvedAbc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* PR Header Inputs */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="prNumber">Purchase Request (PR) Number</Label>
            <Input
              id="prNumber"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              placeholder="e.g. PR-2026-0012"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purpose">PR Purpose / Project Title</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Enter purpose of PR"
            />
          </div>
        </div>

        {/* PR Line Items Entry & ABC Validation Section */}
        <div className="space-y-3 rounded-lg border border-default-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-bold text-default-900">
                PR Line Items & Quantities
              </Label>
              <p className="text-xs text-muted-foreground">
                Specify quantities and unit prices. Total line items cost must not exceed approved ABC cap.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLineItem}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-default-200">
            <Table>
              <TableHeader className="bg-default-50">
                <TableRow>
                  <TableHead className="w-[38%]">Item Description</TableHead>
                  <TableHead className="w-[16%]">Unit of Measure</TableHead>
                  <TableHead className="w-[14%]">Quantity</TableHead>
                  <TableHead className="w-[18%]">Unit Price (₱)</TableHead>
                  <TableHead className="w-[14%] text-right">Total (₱)</TableHead>
                  <TableHead className="w-[8%] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => {
                  const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          value={item.unitOfMeasure}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitOfMeasure', e.target.value)}
                          placeholder="e.g. lot / unit"
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs p-2 text-default-900">
                        ₱{lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cost Summary & ABC Validation Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Total Line Items Cost: </span>
              <span className={`font-extrabold text-sm ${isExceedingAbc ? 'text-destructive' : 'text-emerald-700'}`}>
                ₱{totalLineItemsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground ml-2">
                (Approved ABC Cap: ₱{approvedAbc.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            </div>

            {isExceedingAbc && (
              <Alert variant="destructive" className="py-2 px-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs font-semibold">
                  Total cost exceeds approved ABC cap by ₱
                  {(totalLineItemsCost - approvedAbc).toLocaleString('en-US', { minimumFractionDigits: 2 })}.
                  Adjust quantities or unit prices.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
