import { useState } from 'react'
import { mockBids } from '../mocks/mockData'
import type { SupplierBid } from '../types'
import { useToast } from '@/components/ui/use-toast'

export function useSupplierEvaluation(projectId: string) {
  const { toast } = useToast()
  const [bids, setBids] = useState<SupplierBid[]>(
    mockBids.filter(b => b.projectId === projectId)
  )
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null)
  const [evalStatus, setEvalStatus] = useState<string>('')
  const [evalRemarks, setEvalRemarks] = useState<string>('')

  const selectedBid = bids.find(b => b.id === selectedBidId)

  const handleSelectBid = (bidId: string, status: string) => {
    setSelectedBidId(bidId)
    setEvalStatus(status)
    setEvalRemarks('')
  }

  const handleSaveEvaluation = () => {
    // Validate: remarks required if Failed
    if (evalStatus === 'Failed' && !evalRemarks.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Remarks are required when marking an application as Failed.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedBidId || !evalStatus) return
    
    setBids(prev => prev.map(bid => 
      bid.id === selectedBidId 
        ? { 
            ...bid, 
            status: evalStatus as 'Passed' | 'Failed' | 'Pending',
            remarks: evalRemarks,
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: 'Current Officer', // TODO: Replace with actual current user
          } 
        : bid
    ))
    
    toast({
      title: 'Evaluation Saved',
      description: `Supplier bid marked as ${evalStatus}.`,
    })
    
    setEvalRemarks('')
  }

  return {
    bids,
    selectedBid,
    selectedBidId,
    evalStatus,
    evalRemarks,
    setEvalStatus,
    setEvalRemarks,
    handleSelectBid,
    handleSaveEvaluation
  }
}
