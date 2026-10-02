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
  Send,
  RotateCcw,
  CheckCircle,
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
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrderForApproval,
  useApprovePurchaseOrder,
  useReturnPurchaseOrder,
  uploadPoDocument,
} from '../handlers'
import { useGetAOBById } from '@/features/procurement/aob/handlers/getAOBByIdRequest'
import { getBidMatrixRequest } from '@/features/procurement/aob/handlers/getBidMatrixRequest'
import { downloadPurchaseOrderBlob } from '../utils/downloadPurchaseOrderBlob'
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8"
            onClick={() => printPurchaseOrder(fullPo)}
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
              {canSubmit && (
                <>
                  <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit PO
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={handleSubmitForApproval}
                    disabled={submitMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </DropdownMenuItem>
                  {normalizedStatus === 'draft' && (
                    <DropdownMenuItem
                      onSelect={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete PO
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {canForApproval && (
                <>
                  <DropdownMenuItem
                    onSelect={() => setIsReturnOpen(true)}
                    disabled={returnMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setIsApproveOpen(true)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

