/**
 * Link Source Document Modal
 * Two-tab modal for selecting PO or Contract
 * Task 6: Build Link PO/Contract modal (two-tab selection)
 */

import { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { isLinkSourceDocumentModalOpenAtom } from '../atoms/ntpAtoms'
import { mockNTPStore } from '../utils/mockNTPStore'
import type { ApprovedPOForNTP, ApprovedContractForNTP } from '../types/ntpTypes'

export interface LinkSourceDocumentModalProps {
  onSourceSelected?: (sourceDoc: ApprovedPOForNTP | ApprovedContractForNTP, type: 'PO' | 'Contract') => void
}

export function LinkSourceDocumentModal({ onSourceSelected }: LinkSourceDocumentModalProps) {
  const [isModalOpen, setIsModalOpen] = useAtom(isLinkSourceDocumentModalOpenAtom)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch approved POs
  const { data: approvedPOs = [] } = useQuery({
    queryKey: ['approvedPOs'],
    queryFn: () => mockNTPStore.getApprovedPOs(),
  })

  // Fetch approved Contracts
  const { data: approvedContracts = [] } = useQuery({
    queryKey: ['approvedContracts'],
    queryFn: () => mockNTPStore.getApprovedContracts(),
  })

  // Filter POs based on search
  const filteredPOs = useMemo(() => {
    if (!searchQuery) return approvedPOs
    return approvedPOs.filter((po) =>
      po.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [approvedPOs, searchQuery])

  // Filter Contracts based on search
  const filteredContracts = useMemo(() => {
    if (!searchQuery) return approvedContracts
    return approvedContracts.filter((contract) =>
      contract.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.supplier?.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [approvedContracts, searchQuery])

  const handleSelectPO = (po: ApprovedPOForNTP) => {
    onSourceSelected?.(po, 'PO')
    setIsModalOpen(false)
  }

  const handleSelectContract = (contract: ApprovedContractForNTP) => {
    onSourceSelected?.(contract, 'Contract')
    setIsModalOpen(false)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" size='lg'>
        <DialogHeader>
          <DialogTitle>Link Source Document</DialogTitle>
          <DialogDescription>
            Select an approved PO or Contract to link to this NTP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by document number or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="po" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="po">
                Purchase Orders ({approvedPOs.length})
              </TabsTrigger>
              <TabsTrigger value="contract">
                Contracts ({approvedContracts.length})
              </TabsTrigger>
            </TabsList>

            {/* POs Tab */}
            <TabsContent value="po" className="space-y-4">
              {filteredPOs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {approvedPOs.length === 0 ? 'No approved POs available' : 'No POs match your search'}
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">PO Number</TableHead>
                        <TableHead className="min-w-[150px]">Supplier</TableHead>
                        <TableHead className="min-w-[120px]">Amount</TableHead>
                        <TableHead className="min-w-[80px]">Items</TableHead>
                        <TableHead className="min-w-[100px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.poNumber}</TableCell>
                          <TableCell>{po.supplier?.supplierName}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(po.amount)}
                          </TableCell>
                          <TableCell>{po.itemCount} item(s)</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectPO(po)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contract" className="space-y-4">
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {approvedContracts.length === 0 ? 'No approved Contracts available' : 'No Contracts match your search'}
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">Contract Number</TableHead>
                        <TableHead className="min-w-[150px]">Supplier</TableHead>
                        <TableHead className="min-w-[120px]">Amount</TableHead>
                        <TableHead className="min-w-[80px]">Items</TableHead>
                        <TableHead className="min-w-[100px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            {contract.contractNumber}
                          </TableCell>
                          <TableCell>{contract.supplier?.supplierName}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(contract.amount)}
                          </TableCell>
                          <TableCell>{contract.itemCount} item(s)</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectContract(contract)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
