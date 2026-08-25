import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building,
  Check,
  ExternalLink,
  Pencil,
  FileText,
  MapPin,
  Shield,
  ShieldOff,
  Tag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SupplierRegistryForm } from '../dialog/SupplierRegistryForm'
import {
  useSupplierById,
  useUpdateSupplierStatus,
  useVerifySupplierRequirements,
} from '../useSuppliers'
import type {
  SupplierDetail,
  SupplierRequirementInfo,
  SupplierStatus,
} from '../types'
import type { SupplierRegistry } from '../../types'

interface SupplierDetailPageProps {
  supplierId?: string | null
  supplier?: SupplierRegistry | null
  onBack: () => void
  onBlock?: (supplier: SupplierDetail | SupplierRegistry) => void
  onApprove?: (supplier: SupplierDetail | SupplierRegistry) => void
  onDecline?: (supplier: SupplierDetail | SupplierRegistry) => void
}

type SupplierDisplay = {
  id: string
  name: string | null
  categoryName: string | null
  categoryDescription: string | null
  businessPermitNo: string | null
  contactPerson: string | null
  contactNumber: string | null
  address: string | null
  email: string | null
  tinNumber: string | null
  philGEPSNumber: string | null
  isBlacklisted: boolean
  status: SupplierStatus | null
  supplierCategoryId: string
  supplierRequirements: SupplierRequirementInfo[] | null
  createdAt: string
  updatedAt: string | null
}

const normalizeSupplierStatus = (
  value: string | null | undefined,
): SupplierStatus | null => {
  const normalizedValue = value?.trim().toLowerCase()

  if (normalizedValue === 'approved') {
    return 'Approved'
  }

  if (normalizedValue === 'declined') {
    return 'Declined'
  }

  if (normalizedValue === 'pending') {
    return 'Pending'
  }

  return null
}

const normalizeApiSupplier = (supplier: SupplierDetail): SupplierDisplay => ({
  id: supplier.id,
  name: supplier.name,
  categoryName: supplier.supplierCategory?.name ?? null,
  categoryDescription: supplier.supplierCategory?.description ?? null,
  businessPermitNo: supplier.businessPermitNo,
  contactPerson: supplier.contactPerson,
  contactNumber: supplier.contactNumber,
  address: supplier.address,
  email: supplier.email,
  tinNumber: supplier.tinNumber,
  philGEPSNumber: supplier.philGEPSNumber,
  isBlacklisted: supplier.isBlacklisted,
  status: normalizeSupplierStatus(supplier.status),
  supplierCategoryId: supplier.supplierCategoryId,
  supplierRequirements: supplier.supplierRequirements,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
})

const normalizeLegacySupplier = (
  supplier: SupplierRegistry,
): SupplierDisplay => ({
  id: supplier.id,
  name: supplier.supplierName,
  categoryName: supplier.supplierCategory,
  categoryDescription: null,
  businessPermitNo: supplier.businessPermitNo,
  contactPerson: supplier.contactPerson,
  contactNumber: supplier.contactNumber,
  address: supplier.address,
  email: supplier.contactEmail,
  tinNumber: supplier.tinNumber,
  philGEPSNumber: supplier.philGEPSNumber,
  isBlacklisted: supplier.isBlacklisted,
  status: normalizeSupplierStatus(supplier.status),
  supplierCategoryId: supplier.supplierCategory,
  supplierRequirements: null,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
})

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function SupplierDetailPage({
  supplierId,
  supplier,
  onBack,
  onBlock,
  onApprove,
  onDecline,
}: SupplierDetailPageProps) {
  const queryClient = useQueryClient()
  const updateStatusMutation = useUpdateSupplierStatus()
  const verifyRequirementsMutation = useVerifySupplierRequirements()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineStatusNote, setDeclineStatusNote] = useState('')

  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierById({
    pathParams: { id: supplierId ?? '' },
    queryParams: {},
    enabled: Boolean(supplierId),
  })

  const displaySupplier = useMemo<SupplierDisplay | null>(() => {
    if (supplierData?.data) {
      return normalizeApiSupplier(supplierData.data)
    }

    if (supplier) {
      return normalizeLegacySupplier(supplier)
    }

    return null
  }, [supplier, supplierData])

  const targetSupplierId = supplierId ?? displaySupplier?.id ?? null

  const isReviewable = displaySupplier?.status === 'Pending'
  const canUseApiActions = Boolean(targetSupplierId)

  const invalidateSuppliers = () => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith('/suppliers')
      },
    })
  }

  const handleApprove = () => {
    if (!displaySupplier) return

    if (!targetSupplierId) return

    updateStatusMutation.mutate(
      {
        pathParams: { id: targetSupplierId },
        payload: { status: 'Approved' },
      },
      {
        onSuccess: () => {
          toast.success('Supplier status updated successfully')
          invalidateSuppliers()
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update supplier status'
          toast.error(message)
        },
      },
    )
  }

  const handleDecline = () => {
    if (!displaySupplier) return

    if (!targetSupplierId) return

    setDeclineStatusNote('')
    setDeclineDialogOpen(true)
  }

  const handleSubmitDecline = () => {
    const note = declineStatusNote.trim()

    if (!note) {
      toast.error('Status note is required when declining a supplier')
      return
    }

    updateStatusMutation.mutate(
      {
        pathParams: { id: targetSupplierId ?? '' },
        payload: {
          status: 'Declined',
          statusNote: note,
        },
      },
      {
        onSuccess: () => {
          toast.success('Supplier status updated successfully')
          invalidateSuppliers()
          setDeclineDialogOpen(false)
          setDeclineStatusNote('')
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update supplier status'
          toast.error(message)
        },
      },
    )
  }

  const handleToggleBlacklist = () => {
    if (!displaySupplier) return

    if (!targetSupplierId) return

    // send explicit boolean based on current state so we can both block and unblock
    updateStatusMutation.mutate(
      {
        pathParams: { id: targetSupplierId },
        payload: { isBlocked: !displaySupplier.isBlacklisted },
      },
      {
        onSuccess: () => {
          toast.success('Supplier status updated successfully')
          invalidateSuppliers()
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update supplier status'
          toast.error(message)
        },
      },
    )
  }

  const handleToggleRequirementVerification = (
    requirement: SupplierRequirementInfo,
  ) => {
    if (!targetSupplierId) return

    verifyRequirementsMutation.mutate(
      {
        pathParams: { id: targetSupplierId },
        payload: {
          requirements: [
            {
              supplierRequirementId: requirement.supplierRequirementId,
              isVerified: !requirement.isVerified,
            },
          ],
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Requirement marked as ${!requirement.isVerified ? 'verified' : 'pending'}`,
          )
          invalidateSuppliers()
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to update requirement verification status'
          toast.error(message)
        },
      },
    )
  }

  if (isSupplierLoading && !displaySupplier) {
    return (
      <div className="space-y-4 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          Loading supplier details...
        </div>
      </div>
    )
  }

  if (!displaySupplier) {
    return (
      <div className="space-y-4 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          Supplier details are unavailable.
        </div>
      </div>
    )
  }

  // Render details as a full page (not a dialog) to match ItemMaster view layout
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  {displaySupplier.name || 'Unnamed supplier'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Supplier ID: {displaySupplier.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={
                  displaySupplier.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : displaySupplier.status === 'Declined'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }
              >
                {displaySupplier.status || 'Pending'}
              </Badge>
              <Badge
                className={
                  displaySupplier.isBlacklisted
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }
              >
                {displaySupplier.isBlacklisted ? 'Blacklisted' : 'Active'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {(canUseApiActions || onApprove || onDecline || onBlock) && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {isReviewable && (onApprove || onDecline) && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDecline}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </>
              )}
              {(canUseApiActions || onBlock) && (
                <Button
                  variant={
                    displaySupplier.isBlacklisted ? 'outline' : 'destructive'
                  }
                  onClick={handleToggleBlacklist}
                  className="gap-2"
                >
                  {displaySupplier.isBlacklisted ? (
                    <ShieldOff className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {displaySupplier.isBlacklisted
                    ? 'Unblock Supplier'
                    : 'Block Supplier'}
                </Button>
              )}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">
                        Supplier Category
                      </Label>
                      <p className="mt-1 font-medium">
                        {displaySupplier.categoryName || '—'}
                      </p>
                      {displaySupplier.categoryDescription && (
                        <p className="text-sm text-muted-foreground">
                          {displaySupplier.categoryDescription}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Supplier Name
                      </Label>
                      <p className="mt-1 font-medium">
                        {displaySupplier.name || '—'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business Permit No
                      </Label>
                      <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                        {displaySupplier.businessPermitNo || '—'}
                      </code>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        TIN Number
                      </Label>
                      <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                        {displaySupplier.tinNumber || '—'}
                      </code>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <p className="mt-1">{displaySupplier.address || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Contact Person
                      </Label>
                      <p className="mt-1">
                        {displaySupplier.contactPerson || '—'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Contact Number
                      </Label>
                      <p className="mt-1">
                        {displaySupplier.contactNumber || '—'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="mt-1">{displaySupplier.email || '—'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        PhilGEPS Number
                      </Label>
                      <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                        {displaySupplier.philGEPSNumber || '—'}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Supplier Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  {displaySupplier.supplierRequirements &&
                  displaySupplier.supplierRequirements.length > 0 ? (
                    <div className="space-y-3">
                      {displaySupplier.supplierRequirements.map(
                        (requirement) => (
                          <div
                            key={requirement.supplierRequirementId}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">
                                {requirement.requirementName ||
                                  'Unnamed requirement'}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>
                                  Uploaded {formatDateTime(requirement.createdAt)}
                                </span>
                                {requirement.url && (
                                  <a
                                    href={requirement.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    View Document
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  requirement.isVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {requirement.isVerified ? 'Verified' : 'Pending'}
                              </Badge>
                              {canUseApiActions && isReviewable && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    verifyRequirementsMutation.isPending
                                  }
                                  onClick={() =>
                                    handleToggleRequirementVerification(
                                      requirement,
                                    )
                                  }
                                >
                                  {requirement.isVerified
                                    ? 'Mark Pending'
                                    : 'Verify'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No supplier requirements returned by the API.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="mt-1">
                      {formatDateTime(displaySupplier.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Updated At</Label>
                    <p className="mt-1">
                      {formatDateTime(displaySupplier.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Decline Supplier</DialogTitle>
                <DialogDescription>
                  Add a status note explaining why this supplier is being
                  declined.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="supplier-decline-note">Status Note</Label>
                <Textarea
                  id="supplier-decline-note"
                  value={declineStatusNote}
                  onChange={(event) => setDeclineStatusNote(event.target.value)}
                  placeholder="Enter the reason for declining this supplier"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeclineDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleSubmitDecline}>
                  Decline Supplier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SupplierRegistryForm
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            supplierId={displaySupplier.id}
            onSaved={invalidateSuppliers}
          />
        </div>
      </div>
    </div>
  )
}
