import * as React from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  Edit,
  FileCheck,
  FileText,
  HelpCircle,
  Receipt,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { UpdateDirectContractingDialog } from '../components/UpdateDirectContractingDialog'
import {
  useChangeDirectContractingStatus,
  useDeleteDirectContracting,
  useDirectContracting,
} from '../handlers'
import { DirectContractingStatusEnum } from '../types'
import type { AxiosError } from 'erpez-shared-lib'
import { PageContainerDashtail } from '@/components/v2'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

import { extractErrorMessage } from '@/services/utils/messages'
import { cn } from '@/lib/utils'

// Lazy-loaded tab components to optimize performance and bundle size
const ProposalQuotationTab = React.lazy(() =>
  import('./tabs/ProposalQuotationTab').then((m) => ({ default: m.ProposalQuotationTab }))
)
const BacProjectTab = React.lazy(() =>
  import('./tabs/BacProjectTab').then((m) => ({ default: m.BacProjectTab }))
)
const SupplierComplianceTab = React.lazy(() =>
  import('./tabs/SupplierComplianceTab').then((m) => ({ default: m.SupplierComplianceTab }))
)

export type TabKey = 'quotation' | 'bac-project' | 'supplier'

export interface DirectContractingDetailPageProps {
  id: string
  tab?: TabKey
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  [DirectContractingStatusEnum.DRAFT]: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: ShoppingCart,
  },
  [DirectContractingStatusEnum.FOR_REVIEW]: {
    label: 'For Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: FileCheck,
  },
  [DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER]: {
    label: 'Sent to Supplier',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: Send,
  },
  [DirectContractingStatusEnum.PENDING_FOR_APPROVAL]: {
    label: 'Pending Approval',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    icon: Clock,
  },
  [DirectContractingStatusEnum.APPROVED]: {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: ShieldCheck,
  },
  [DirectContractingStatusEnum.RETURNED]: {
    label: 'Returned',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    icon: AlertCircle,
  },
}

function TabLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DirectContractingDetailPage({ id, tab }: DirectContractingDetailPageProps) {
  const navigate = useNavigate()
  const activeTab: TabKey = tab || 'quotation'

  const handleTabChange = (newTab: string) => {
    navigate({
      to: '/v2/direct-contracting-request/$id',
      params: { id },
      search: { tab: newTab as TabKey },
    })
  }

  // Primary Query: Direct Contracting Request
  const {
    data: directContractingResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDirectContracting({
    pathParams: { id },
  })
  const item = directContractingResponse?.data


  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false)
  const [showConvertToDraftConfirm, setShowConvertToDraftConfirm] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const statusMutation = useChangeDirectContractingStatus()
  const deleteMutation = useDeleteDirectContracting()

  const handleSubmitForReview = async () => {
    try {
      await statusMutation.mutateAsync({
        pathParams: { id },
        payload: { status: DirectContractingStatusEnum.FOR_REVIEW },
      })
      toast.success('Direct Contracting request submitted for review successfully.')
      setShowSubmitConfirm(false)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err as AxiosError) || 'Failed to submit request for review.')
    }
  }

  const handleConvertToDraft = async () => {
    try {
      await statusMutation.mutateAsync({
        pathParams: { id },
        payload: { status: DirectContractingStatusEnum.DRAFT },
      })
      toast.success('Direct Contracting request converted back to draft successfully.')
      setShowConvertToDraftConfirm(false)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err as AxiosError) || 'Failed to convert request to draft.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        pathParams: { id },
      })
      toast.success('Direct Contracting request deleted successfully.')
      setShowDeleteConfirm(false)
      navigate({ to: '/v2/direct-contracting-request' })
    } catch (err) {
      toast.error(extractErrorMessage(err as AxiosError) || 'Failed to delete request.')
    }
  }

  // Error State
  if (isError || (!isLoading && !item)) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-2xl py-16">
        <Card className="border-destructive/40 shadow-sm text-center p-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Request Not Found</CardTitle>
          <CardDescription>
            {error
              ? extractErrorMessage(error as AxiosError)
              : 'The requested Direct Contracting record could not be retrieved. It may have been removed or you do not have permission to view it.'}
          </CardDescription>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/v2/direct-contracting-request' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
            </Button>
            <Button onClick={() => refetch()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const statusConfig =
    item?.status && STATUS_CONFIG[item.status]
      ? STATUS_CONFIG[item.status]
      : {
        label: item?.status || 'Loading...',
        badgeClass: 'bg-muted text-muted-foreground border-border',
        icon: HelpCircle,
      }
  const StatusIcon = statusConfig.icon

  return (
    <PageContainerDashtail
      title={item ? (item.name || item.dcName) : 'Loading Request...'}
      titleIcon={<Receipt className="h-6 w-6" />}
      description="Procurement through single proprietary supplier pursuant to Republic Act No. 12009 Rule XVI."
      headerVariant="branded"
      badge={
        item && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs px-2.5 py-0.5 font-bold text-primary bg-primary/10 border-primary/20"
            >
              {item.dcNumber}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-xs px-2.5 py-0.5 font-semibold gap-1.5', statusConfig.badgeClass)}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>
        )
      }
      actions={
        item && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-1.5"
            >
              <Edit className="h-4 w-4" /> Edit Request
            </Button>
            {item.status === DirectContractingStatusEnum.FOR_REVIEW || item.status === DirectContractingStatusEnum.RETURNED ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConvertToDraftConfirm(true)}
                className="gap-1.5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <RotateCcw className="h-4 w-4" /> Convert to Draft
              </Button>
            ) : item.status === DirectContractingStatusEnum.DRAFT ? (
              <Button
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Send className="h-4 w-4" /> Submit for Review
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete Request
            </Button>
          </div>
        )
      }
      backTo="/v2/direct-contracting-request"
      backLabel="Back to Direct Contracting Requests"
      mode="tabbed"
      tabVariant="underline"
      tabs={[
        {
          id: 'quotation',
          label: 'Proposal & Quotation',
          icon: <Receipt className="h-4 w-4 mr-1.5" />,
        },
        {
          id: 'bac-project',
          label: 'BAC Project & Resolution',
          icon: <FileText className="h-4 w-4 mr-1.5" />,
        },
        {
          id: 'supplier',
          label: 'Supplier Profile & Compliance',
          icon: <Building2 className="h-4 w-4 mr-1.5" />,
        },
      ]}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {/* Loading Skeleton */}
      {isLoading && <TabLoadingSkeleton />}

      {/* Tab Contents with Lazy Loading and Suspense */}
      {!isLoading && item && (
        <React.Suspense fallback={<TabLoadingSkeleton />}>
          {activeTab === 'quotation' && (
            <ProposalQuotationTab
              item={item}
              onSwitchToSupplierTab={() => handleTabChange('supplier')}
            />
          )}

          {activeTab === 'bac-project' && (
            <BacProjectTab
              bacProjectId={item.bacProjectId}
              fallbackTitle={item.bacProjectTitle}
              fallbackAbc={item.totalABC}
            />
          )}

          {activeTab === 'supplier' && (
            <SupplierComplianceTab
              supplierId={item.exclusiveSupplierId}
              fallbackName={item.exclusiveSupplierName}
              fallbackContact={item.exclusiveSupplierContact}
              fallbackEmail={item.exclusiveSupplierEmail}
              fallbackPhilGeps={item.exclusiveSupplierPhilGEPS}
            />
          )}
        </React.Suspense>
      )}

      {/* Edit Request Dialog */}
      <UpdateDirectContractingDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            refetch()
          }
        }}
        editEntryId={id}
      />

      {/* Submit for Review Confirmation */}
      <ConfirmAlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Request for Review"
        description="Are you sure you want to submit this Direct Contracting request for review? Once submitted, the procurement team will review the justification and BAC resolution before dispatching to the supplier."
        confirmLabel="Submit for Review"
        cancelLabel="Cancel"
        loading={statusMutation.isPending}
        onConfirm={handleSubmitForReview}
      />

      {/* Convert to Draft Confirmation */}
      <ConfirmAlertDialog
        open={showConvertToDraftConfirm}
        onOpenChange={setShowConvertToDraftConfirm}
        title="Convert Request to Draft"
        description="Are you sure you want to convert this Direct Contracting request back to draft? It will be editable again."
        confirmLabel="Convert to Draft"
        cancelLabel="Cancel"
        loading={statusMutation.isPending}
        onConfirm={handleConvertToDraft}
      />

      {/* Delete Request Confirmation */}
      <ConfirmAlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Direct Contracting Request"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete Request"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageContainerDashtail>
  )
}
