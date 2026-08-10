import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Eye } from 'lucide-react'
import {
  useLIBAmendments,
  useApproveLIBAmendment,
  useReturnLIBAmendment,
} from '@/features/planning/line-item-budgeting/realignment/hooks/useLIBAmendments'
import { useQueryClient } from '@tanstack/react-query'
import type { LIBAmendment } from '@/features/planning/line-item-budgeting/line-item-budget/types/type'
import { RealignmentReviewDetailPage } from './RealignmentReviewDetailPage'

export function RealignmentRequestsTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [reviewingAmendment, setReviewingAmendment] = useState<LIBAmendment | null>(
    null,
  )

  const { data: amendmentsData, isLoading } = useLIBAmendments({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
      // Fetch only Submitted, Approved, or Returned requests for the management view
      filters: 'status==Submitted|status==Approved|status==Returned',
    },
  })

  const { mutateAsync: approveAmendment, isPending: isApproving } =
    useApproveLIBAmendment()
  const { mutateAsync: returnAmendment, isPending: isReturning } =
    useReturnLIBAmendment()

  const amendments = amendmentsData?.data || []

  const handleApprove = async (id: string) => {
    try {
      await approveAmendment({ pathParams: { id } })
      toast({
        title: 'Amendment Approved',
        description: 'The realignment request has been approved successfully.',
      })
      await queryClient.invalidateQueries({
        queryKey: ['/lib-amendment-requests'],
      })
      setReviewingAmendment(null)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to approve the amendment.',
        variant: 'destructive',
      })
    }
  }

  const handleReturn = async (id: string) => {
    try {
      await returnAmendment({ pathParams: { id } })
      toast({
        title: 'Amendment Returned',
        description: 'The realignment request has been returned.',
      })
      await queryClient.invalidateQueries({
        queryKey: ['/lib-amendment-requests'],
      })
      setReviewingAmendment(null)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to return the amendment.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
      case 'Approved':
        return 'bg-green-100 text-green-700 hover:bg-green-100'
      case 'Returned':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100'
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100'
    }
  }

  if (reviewingAmendment) {
    return (
      <RealignmentReviewDetailPage
        amendment={reviewingAmendment}
        onBack={() => setReviewingAmendment(null)}
        onApprove={handleApprove}
        onReturn={handleReturn}
        isApproving={isApproving}
        isReturning={isReturning}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">
            Realignment Requests Management
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Review and manage submitted line-item budget amendment requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : amendments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm border border-dashed rounded-xl">
              No amendment requests found.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-xs">Request ID</TableHead>
                    <TableHead className="font-semibold text-xs">Original LIB Ref</TableHead>
                    <TableHead className="font-semibold text-xs">Reason</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="text-center font-semibold text-xs w-28">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amendments.map((amendment) => (
                    <TableRow key={amendment.id}>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {amendment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-semibold text-xs">
                        {amendment.lineItemBudget?.libNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-slate-900">
                            {amendment.reason}
                          </span>
                          {amendment.justification && (
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[250px]">
                              {amendment.justification}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${getStatusBadge(
                            amendment.status,
                          )}`}
                        >
                          {amendment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold shadow-xs"
                          onClick={() => setReviewingAmendment(amendment)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
