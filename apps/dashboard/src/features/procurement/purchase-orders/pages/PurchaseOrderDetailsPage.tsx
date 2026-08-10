import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  Printer,
  Link2,
  Send,
  RotateCcw,
  CheckCircle,
  MoreVertical,
} from 'lucide-react'
import { PurchaseOrderDetailsShell } from '../components/PurchaseOrderDetailsShell'
import {
  ApprovePurchaseOrderDialog,
  ReturnPurchaseOrderDialog,
  SelectAobDialog,
  SelectNoaDialog,
} from '../dialogs'
import { usePurchaseOrderStore } from '../data/purchaseOrderStore'
import { downloadPurchaseOrderBlob } from '../utils/downloadPurchaseOrderBlob'

type PurchaseOrderDetailsPageProps = {
  purchaseOrderId: string
}

export function PurchaseOrderDetailsPage({
  purchaseOrderId,
}: PurchaseOrderDetailsPageProps) {
  const navigate = useNavigate()
  const purchaseOrder = usePurchaseOrderStore((state) =>
    state.getPurchaseOrderById(purchaseOrderId),
  )
  const backRoute =
    purchaseOrder?.source === 'public-bidding'
      ? '/v2/po-public-bidding'
      : purchaseOrder?.source === 'direct-acquisition'
      ? '/v2/po-direct-acquisition'
      : '/v2/po-svp'

  const printPurchaseOrder = usePurchaseOrderStore((state) => state.printPurchaseOrder)
  const submitForApproval = usePurchaseOrderStore((state) => state.submitForApproval)
  const linkAob = usePurchaseOrderStore((state) => state.linkAob)
  const linkNoa = usePurchaseOrderStore((state) => state.linkNoa)
  const returnPurchaseOrder = usePurchaseOrderStore((state) => state.returnPurchaseOrder)
  const approvePurchaseOrder = usePurchaseOrderStore((state) => state.approvePurchaseOrder)

  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isAobPickerOpen, setIsAobPickerOpen] = useState(false)
  const [isNoaPickerOpen, setIsNoaPickerOpen] = useState(false)

  if (!purchaseOrder) {
    return (
      <div className="space-y-4 pb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link to={backRoute}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p>The record may have been removed or the route parameter is invalid.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canSubmit = purchaseOrder.status === 'draft' || purchaseOrder.status === 'returned'
  const canForApproval = purchaseOrder.status === 'for-approval'

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button & Actions row — matches PR Details page */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          asChild
        >
          <Link to={backRoute}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={() => {
              const result = printPurchaseOrder(purchaseOrder.id)
              if (result) downloadPurchaseOrderBlob(result)
            }}
          >
            <Printer className="h-4 w-4" />
            Print PO
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {purchaseOrder.source === 'svp' && purchaseOrder.status !== 'approved' && (
                <DropdownMenuItem onSelect={() => setIsAobPickerOpen(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Add AOB
                </DropdownMenuItem>
              )}
              {purchaseOrder.source === 'public-bidding' && purchaseOrder.status !== 'approved' && (
                <DropdownMenuItem onSelect={() => setIsNoaPickerOpen(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Select NOA
                </DropdownMenuItem>
              )}
              {canSubmit && (
                <DropdownMenuItem
                  onSelect={() => {
                    submitForApproval({ purchaseOrderId: purchaseOrder.id })
                    navigate({ to: '/v2/po/$purchaseOrderId', params: { purchaseOrderId: purchaseOrder.id } })
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </DropdownMenuItem>
              )}
              {canForApproval && (
                <>
                  <DropdownMenuItem onSelect={() => setIsReturnOpen(true)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setIsApproveOpen(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PurchaseOrderDetailsShell purchaseOrder={purchaseOrder} />

      <ReturnPurchaseOrderDialog
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        onSubmit={(reason) => {
          returnPurchaseOrder({ purchaseOrderId: purchaseOrder.id, reason })
          setIsReturnOpen(false)
        }}
      />

      <ApprovePurchaseOrderDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        onSubmit={(signedDocument) => {
          approvePurchaseOrder({ purchaseOrderId: purchaseOrder.id, signedDocument })
          setIsApproveOpen(false)
        }}
      />

      <SelectAobDialog
        open={isAobPickerOpen}
        onOpenChange={setIsAobPickerOpen}
        selectedAobId={purchaseOrder.sourceDocumentId}
        onSelect={(aobId) => {
          linkAob({ purchaseOrderId: purchaseOrder.id, aobId })
          setIsAobPickerOpen(false)
        }}
      />

      <SelectNoaDialog
        open={isNoaPickerOpen}
        onOpenChange={setIsNoaPickerOpen}
        selectedNoaId={purchaseOrder.sourceDocumentId}
        onSelect={(noaId) => {
          linkNoa({ purchaseOrderId: purchaseOrder.id, noaId })
          setIsNoaPickerOpen(false)
        }}
      />
    </div>
  )
}
