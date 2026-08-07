/**
 * APR Details Page
 * Displays complete APR information: header, items, timeline, and actions
 * ✅ FIXED: Supports dynamic navigation back to origin (manage-aprs or apr list)
 */

import React, { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  APRHeaderSection,
  APRStatsGrid,
  ConsolidatedItemsTable,
  APRTermsConditionsSection,
  APRActionsSection,
} from '@/features/procurement/apr/components'
import {
  SubmitAPRDialog,
  ReturnAPRDialog,
  ApproveAPRDialog,
  AddItemDialog,
} from '@/features/procurement/apr/dialogs'
import { APRStatus } from '@/features/procurement/apr/types'
import { getAPRRequest } from '@/features/procurement/apr/handlers'
import type { APRMaster, ConsolidatedAPRItem } from '@/features/procurement/apr/types'

interface APRDetailsPageProps {
  aprId: string
}

// ✅ Type for search parameters
interface SearchParams {
  from?: string
}

export default function APRDetailsPage({ aprId }: APRDetailsPageProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '__root__' }) as SearchParams
  const { toast } = useToast()
  const [apr, setApr] = useState<APRMaster | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch APR details
  React.useEffect(() => {
    const fetchAPR = async () => {
      if (!aprId) return
      try {
        setIsLoading(true)
        const response = await getAPRRequest.fetcher({
          finalUrl: `/aprs/${aprId}`,
        })
        setApr(response.data)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load APR details'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchAPR()
  }, [aprId])

  // Action handlers
  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
      console.log('Submitting APR for review:', apr?.id)
      if (apr) {
        setApr({
          ...apr,
          status: APRStatus.FOR_APPROVAL,
          submittedAt: new Date().toISOString(),
        })
        toast({
          title: 'Success',
          description: `APR ${apr.aprNumber} has been submitted for review.`,
        })
      }
      setSubmitDialogOpen(false)
    } catch (err) {
      console.error('Error submitting APR:', err)
      toast({
        title: 'Error',
        description: 'Failed to submit APR. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturnAPR = async (remarks: string) => {
    setIsSubmitting(true)
    try {
      console.log('Returning APR:', apr?.id, 'with remarks:', remarks)
      if (apr) {
        setApr({
          ...apr,
          status: APRStatus.RETURNED,
          returnRemarks: remarks,
          returnedAt: new Date().toISOString(),
          returnedBy: 'Current User',
        })
        toast({
          title: 'Returned',
          description: `APR ${apr.aprNumber} has been returned for revisions.`,
        })
      }
      setReturnDialogOpen(false)
    } catch (err) {
      console.error('Error returning APR:', err)
      toast({
        title: 'Error',
        description: 'Failed to return APR. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveAPR = async (file?: File) => {
    setIsSubmitting(true)
    try {
      console.log('Approving APR:', apr?.id, 'with file:', file?.name)
      if (apr) {
        setApr({
          ...apr,
          status: APRStatus.APPROVED,
          approvedAt: new Date().toISOString(),
          approvedBy: 'Current User',
          signedDocumentUrl: file ? URL.createObjectURL(file) : apr.signedDocumentUrl,
        })
        toast({
          title: 'Approved',
          description: `APR ${apr.aprNumber} has been approved.${file ? ' Signed document uploaded.' : ''}`,
        })
      }
      setApproveDialogOpen(false)
    } catch (err) {
      console.error('Error approving APR:', err)
      toast({
        title: 'Error',
        description: 'Failed to approve APR. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddItems = async (items: ConsolidatedAPRItem[]) => {
    try {
      if (apr) {
        const updatedItems = [...apr.consolidatedItems, ...items]
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalAmount, 0)
        setApr({
          ...apr,
          consolidatedItems: updatedItems,
          totalAmount: totalAmount,
          totalItemsCount: updatedItems.length,
        })
        toast({
          title: 'Success',
          description: `${items.length} item(s) added to APR ${apr.aprNumber}.`,
        })
      }
    } catch (err) {
      console.error('Error adding items:', err)
      toast({
        title: 'Error',
        description: 'Failed to add items. Please try again.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading APR details...</p>
        </div>
      </div>
    )
  }

  if (error || !apr) {
    // ✅ FIXED: Use "from" parameter to support navigation from admin routes
    const handleBackClick = () => {
      if (search.from) {
        navigate({ to: search.from })
      } else {
        navigate({ to: '/v2/agency-purchase-requests-apr' })
      }
    }
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">
              {error || 'APR not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine available actions based on status
  const canSubmitForReview = apr.status === APRStatus.DRAFT
  const canReturn = apr.status === APRStatus.FOR_APPROVAL
  const canApprove = apr.status === APRStatus.FOR_APPROVAL
  const canAddItems =
    apr.status === APRStatus.DRAFT ||
    apr.status === APRStatus.RETURNED

  // ✅ FIXED: Handle back navigation - use "from" parameter to support admin routes
  const handleBackClick = () => {
    if (search.from) {
      navigate({ to: search.from })
    } else {
      navigate({ to: '/v2/agency-purchase-requests-apr' })
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Navigation */}
      <div className="sticky top-0 bg-white border-b z-40 pt-6 -mx-6 px-6 pb-4">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to APRs
        </Button>
      </div>

      {/* APR Header Section */}
      <div>
        <APRHeaderSection apr={apr} />
      </div>

      {/* APR Stats */}
      <div>
        <APRStatsGrid
          totalItemsCount={apr.consolidatedItems.length}
          totalAmount={apr.totalAmount}
          consolidatedCount={apr.consolidatedItems.length}
          approvalStatus={apr.status}
        />
      </div>

      {/* Tabs: Items, Terms, Actions */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Items ({apr.consolidatedItems.length})</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consolidated Items</h3>
            {canAddItems && (
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => setAddItemDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
          <ConsolidatedItemsTable items={apr.consolidatedItems} />
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <APRTermsConditionsSection terms={apr.terms} />
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <APRActionsSection
            apr={apr}
            canSubmitForReview={canSubmitForReview}
            canReturn={canReturn}
            canApprove={canApprove}
            isSubmitting={isSubmitting}
            onSubmit={() => setSubmitDialogOpen(true)}
            onReturn={() => setReturnDialogOpen(true)}
            onApprove={() => setApproveDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SubmitAPRDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmitForReview}
      />

      <ReturnAPRDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleReturnAPR}
      />

      <ApproveAPRDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        apr={apr}
        isSubmitting={isSubmitting}
        onConfirm={handleApproveAPR}
      />

      <AddItemDialog
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        existingItemIds={apr.consolidatedItems.map((item) => item.id)}
        onAddItems={handleAddItems}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
