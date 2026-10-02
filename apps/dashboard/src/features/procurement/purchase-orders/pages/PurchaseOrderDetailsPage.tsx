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
  MoreVertical,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { PurchaseOrderDetailsShell } from '../components/PurchaseOrderDetailsShell'
import {
  ApprovePurchaseOrderDialog,
  EditPurchaseOrderDialog,
  ReturnPurchaseOrderDialog,
} from '../dialogs'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  useGetPurchaseOrderById,
  useGetPurchaseOrderItems,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrderForApproval,
  useApprovePurchaseOrder,
  useReturnPurchaseOrder,
  uploadPoDocument,
} from '../handlers'
import { useGetAOBById } from '@/features/procurement/aob/handlers/getAOBByIdRequest'
import { getBidMatrixRequest } from '@/features/procurement/aob/handlers/getBidMatrixRequest'
import { printPurchaseOrder } from '../utils/printPurchaseOrder'
import { toast } from 'sonner'

const useBidMatrix = createQueryHookFromTemplate(getBidMatrixRequest)

type PurchaseOrderDetailsPageProps = {
  purchaseOrderId: string
}

function normalizeStatus(status?: string): string {
  if (!status) return 'draft'
  const s = status.toLowerCase().replace(/[-_]/g, '')
  if (s === 'forapproval') return 'for-approval'
  return s
}

export function PurchaseOrderDetailsPage({
  purchaseOrderId,
}: PurchaseOrderDetailsPageProps) {
  const navigate = useNavigate()

  const { data: purchaseOrder, isLoading } = useGetPurchaseOrderById(purchaseOrderId)
  const { data: lineItems = [] } = useGetPurchaseOrderItems(purchaseOrderId)

  const submitMutation = useSubmitPurchaseOrderForApproval()
  const deleteMutation = useDeletePurchaseOrder()
  const approveMutation = useApprovePurchaseOrder()
  const returnMutation = useReturnPurchaseOrder()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('po-details')

  const poMode = (purchaseOrder?.source || purchaseOrder?.procurementMode || '').toString().toLowerCase()
  const backRoute =
    poMode.includes('public')
      ? '/v2/po-public-bidding'
      : poMode.includes('direct')
        ? '/v2/po-direct-acquisition'
        : '/v2/po-svp'

  const sourceDocType = (purchaseOrder?.sourceDocumentType || '').toUpperCase()
  const sourceDocId = purchaseOrder?.sourceDocumentId
  const isAob = sourceDocType === 'AOB' && !!sourceDocId

  // Fetch live AOB details if source document is AOB
  const {
    data: aob,
    isLoading: isAobLoading,
  } = useGetAOBById(
    { pathParams: { id: sourceDocId || '' } }
  )

  // Fetch live Bid Matrix for AOB
  const {
    data: bidMatrix,
  } = useBidMatrix(
    { pathParams: { aobId: sourceDocId || '' } }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading purchase order details...</span>
      </div>
    )
  }

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

  // Combine items
  const fullPo = {
    ...purchaseOrder,
    lineItems: lineItems.length > 0 ? lineItems : (purchaseOrder.lineItems ?? purchaseOrder.items ?? []),
  }

  const normalizedStatus = normalizeStatus(purchaseOrder.status)
  const canSubmit = normalizedStatus === 'draft' || normalizedStatus === 'returned'
  const canForApproval = normalizedStatus === 'for-approval'

  const handleSubmitForApproval = async () => {
    try {
      await submitMutation.mutateAsync(purchaseOrder.id)
      toast.success('Purchase Order submitted for approval!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit Purchase Order.')
    }
  }

  const handleApprove = async (signedDocument: File) => {
    try {
      if (signedDocument) {
        await uploadPoDocument(signedDocument)
      }
      await approveMutation.mutateAsync(purchaseOrder.id)
      toast.success('Purchase Order approved!')
      setIsApproveOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve Purchase Order.')
    }
  }

  const handleReturn = async (reason: string) => {
    try {
      await returnMutation.mutateAsync({
        id: purchaseOrder.id,
        request: { returnReason: reason },
      })
      toast.success('Purchase Order returned!')
      setIsReturnOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to return Purchase Order.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(purchaseOrder.id)
      toast.success('Purchase Order deleted successfully!')
      setIsDeleteOpen(false)
      navigate({ to: backRoute as any })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete Purchase Order.')
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button & Actions row */}
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

        <div className="flex items-center gap-2 flex-wrap">

          {canSubmit && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-8"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit PO</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={() => printPurchaseOrder(fullPo)}
          >
            <Printer className="h-4 w-4" />
            <span>Print PO</span>
          </Button>

          {normalizedStatus === 'draft' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete PO
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <PurchaseOrderDetailsShell
        purchaseOrder={fullPo}
        isAob={isAob}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aobData={{
          aob,
          bidMatrix,
          isLoading: isAobLoading,
        }}
        onOpenSubmit={() => setIsSubmitConfirmOpen(true)}
        onOpenApprove={() => setIsApproveOpen(true)}
        onOpenReturn={() => setIsReturnOpen(true)}
        isSubmitting={submitMutation.isPending}
        canSubmit={canSubmit}
        canForApproval={canForApproval}
      />

      <ConfirmAlertDialog
        open={isSubmitConfirmOpen}
        onOpenChange={setIsSubmitConfirmOpen}
        title="Submit Purchase Order for Approval?"
        description={`Are you sure you want to submit purchase order "${purchaseOrder.poNumber || ''}" for approval? Once submitted, it will be sent for review and approval by the Head of the Procuring Entity (HOPE).`}
        confirmLabel="Submit for Approval"
        loading={submitMutation.isPending}
        onConfirm={async () => {
          await handleSubmitForApproval()
          setIsSubmitConfirmOpen(false)
        }}
      />

      <EditPurchaseOrderDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        purchaseOrder={purchaseOrder}
      />

      <ConfirmAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Purchase Order"
        description={`Are you sure you want to delete purchase order "${purchaseOrder.poNumber || ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />

      <ReturnPurchaseOrderDialog
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        onSubmit={handleReturn}
        isSubmitting={returnMutation.isPending}
      />

      <ApprovePurchaseOrderDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        onSubmit={handleApprove}
        isSubmitting={approveMutation.isPending}
      />
    </div>
  )
}

