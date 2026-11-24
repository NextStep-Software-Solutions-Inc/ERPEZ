import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DirectContractingItemDetails } from '../_components/DirectContractingItemDetails'
import { useDirectContracting } from '@/features/procurement/direct-contracting/handlers'
import { useSupplierDirectContracting } from '../handlers/supplierPortalRequests'
import type { DirectContracting } from '@/features/procurement/direct-contracting/types'

export interface SupplierDirectContractingDetailPageProps {
  id: string
  supplierId?: string
}

export function SupplierDirectContractingDetailPage({
  id,
  supplierId,
}: SupplierDirectContractingDetailPageProps) {
  const navigate = useNavigate()

  const activeSupplierId =
    supplierId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('erpez_active_supplier_id') || undefined
      : undefined)

  // Try fetching using supplier endpoint first, fallback to standard DC endpoint
  const {
    data: supplierData,
    isLoading: isLoadingSupplier,
    isError: isErrorSupplier,
    refetch: refetchSupplier,
  } = useSupplierDirectContracting({
    pathParams: { id },
    queryParams: { id: id, supplierId: activeSupplierId },
  })

  const {
    data: bacData,
    isLoading: isLoadingBac,
    isError: isErrorBac,
    refetch: refetchBac,
  } = useDirectContracting({
    pathParams: { id }, queryParams: {}
  })

  const item: DirectContracting | undefined = supplierData || bacData?.data
  const isLoading = (isLoadingSupplier && isLoadingBac) || (!item && (isLoadingSupplier || isLoadingBac))
  const isError = isErrorSupplier && isErrorBac

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 animate-pulse">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-2xl py-16">
        <Card className="border-destructive/40 shadow-sm text-center p-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Direct Contracting Item Not Found</CardTitle>
          <CardDescription>
            The requested direct contracting invitation could not be retrieved. It may have been reassigned or you do not have permission to view it.
          </CardDescription>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/v2/supplier-portal/direct-contracting-item' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Direct Contracting Items
            </Button>
            <Button
              onClick={() => {
                refetchSupplier()
                refetchBac()
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <DirectContractingItemDetails
      item={item}
      onBack={() => navigate({ to: '/v2/supplier-portal/direct-contracting-item' })}
    />
  )
}
