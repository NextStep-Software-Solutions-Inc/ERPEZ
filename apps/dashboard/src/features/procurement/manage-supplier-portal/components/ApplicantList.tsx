import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SupplierBid } from '../types'

interface ApplicantListProps {
  bids: SupplierBid[]
  selectedBidId: string | null
  onSelectBid: (bidId: string, status: string) => void
}

export function ApplicantList({ bids, selectedBidId, onSelectBid }: ApplicantListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'Failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Failed': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="md:col-span-4 h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-lg">Applicants ({bids.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1">
        {bids.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No bids submitted yet.</div>
        ) : (
          <ul className="divide-y">
            {bids.map(bid => (
              <li 
                key={bid.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                  selectedBidId === bid.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                )}
                onClick={() => onSelectBid(bid.id, bid.status)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{bid.supplierName}</h4>
                    {bid.supplierCategory && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{bid.supplierCategory}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {formatDate(bid.submittedAt)}
                    </p>
                    <p className="text-xs font-medium mt-1">₱{bid.totalBidAmount.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] uppercase gap-1 px-1.5 py-0 shrink-0', getStatusColor(bid.status))}>
                    {getStatusIcon(bid.status)}
                    {bid.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
