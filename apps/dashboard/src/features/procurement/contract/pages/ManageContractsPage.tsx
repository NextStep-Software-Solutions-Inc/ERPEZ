import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, CheckCircle, CornerDownLeft, FileText, Send, CheckCircle2, XCircle, Search as SearchIcon, FileSignature } from 'lucide-react'
import { useContractStore } from '../store/contractStore'
import { ContractDetailsPage } from '../components/ContractDetailsPage'
import { ApproveContractModal } from '../components/ApproveContractModal'
import { ReturnContractModal } from '../components/ReturnContractModal'
import { useToast } from '@/components/ui/use-toast'
import DebouncedInput from '@/components/DebouncedInput'

export function ManageContractsPage() {
  const { contracts, updateContract } = useContractStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 8

  // For modals
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [activeContract, setActiveContract] = useState<string | null>(null)

  // Show 'for-approval' (For Approval), 'approved' (Approved), and 'returned' contracts
  const displayContracts = contracts.filter((c) => 
    (c.status === 'for-approval' || c.status === 'approved' || c.status === 'returned') && 
    (!search || 
      c.contractNumber.toLowerCase().includes(search.toLowerCase()) || 
      (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalPages = Math.max(1, Math.ceil(displayContracts.length / pageSize))
  const paged = displayContracts.slice((page - 1) * pageSize, page * pageSize)

  // Keep page within bounds when displayContracts changes
  useEffect(() => {
    setPage((p) => {
      if (p < 1) return 1
      if (p > totalPages) return totalPages
      return p
    })
  }, [totalPages])

  // Calculate status counts for cards
  const statusCounts = {
    forApproval: contracts.filter((c) => c.status === 'for-approval').length,
    approved: contracts.filter((c) => c.status === 'approved').length,
    returned: contracts.filter((c) => c.status === 'returned').length,
  }
  const totalContracts = statusCounts.forApproval + statusCounts.approved + statusCounts.returned

  if (viewing) {
    return <ContractDetailsPage contractId={viewing} onBack={() => setViewing(null)} />
  }

  const openApprove = (id: string) => {
    setActiveContract(id)
    setApproveOpen(true)
  }

  const openReturn = (id: string) => {
    setActiveContract(id)
    setReturnOpen(true)
  }

  const handleApprove = (signedPdfUrl: string) => {
    if (!activeContract) return
    updateContract(activeContract, {
      signedFileUrl: signedPdfUrl,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Approving Authority',
    })
    setApproveOpen(false)
    setActiveContract(null)
    toast({ 
      title: 'Contract approved', 
      description: 'Contract has been approved and signed file uploaded.' 
    })
  }

  const handleReturn = (remarks: string) => {
    if (!activeContract) return
    updateContract(activeContract, {
      remarks: remarks.trim(),
      status: 'returned',
    })
    setReturnOpen(false)
    setActiveContract(null)
    toast({ 
      title: 'Contract returned', 
      description: 'Contract has been returned with remarks.' 
    })
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Manage Contracts</CardTitle>
              <CardDescription className="text-base">
                Dashboard for Approving Authority to review and approve procurement contracts
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <FileSignature className="h-3.5 w-3.5 mr-1.5" /> Manage Contracts
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contracts For Approval</CardTitle>
              <CardDescription>Contracts pending approval by Approving Authority</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Contracts Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Contracts</p>
                    <p className="text-3xl font-bold text-blue-900">{totalContracts}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Approval Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">For Approval</p>
                    <p className="text-3xl font-bold text-amber-900">{statusCounts.forApproval}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{statusCounts.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Returned Card */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Returned</p>
                    <p className="text-3xl font-bold text-red-900">{statusCounts.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4 px-4 pb-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search contract number, description, or supplier"
                value={search}
                onChange={(v: any) => {
                  setSearch(String(v))
                  setPage(1)
                }}
                className="w-full pl-10"
              />
            </div>
            {/* Page indicator removed from top toolbar - moved to pagination area */}
          </div>

          {displayContracts.length === 0 ? (
            <div className="rounded-md border flex-1 flex flex-col min-h-0">
              <div className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold">No contracts for approval</h3>
                <p className="text-muted-foreground">
                  There are currently no contracts with For Approval status.
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>NOA Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(contract.contractDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contract.noaNumber}
                      </TableCell>
                      <TableCell className="text-sm">{contract.supplierName}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ₱{contract.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {contract.status === 'approved' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            APPROVED
                          </Badge>
                        ) : contract.status === 'draft' && contract.remarks ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            RETURNED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            FOR APPROVAL
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewing(contract.id)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>

                            {contract.status === 'for-approval' && (
                              <>
                                <DropdownMenuItem onClick={() => openApprove(contract.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => openReturn(contract.id)}>
                                  <CornerDownLeft className="h-4 w-4 mr-2 text-destructive" /> Return
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-end px-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ApproveContractModal
        open={approveOpen}
        onOpenChange={(open: boolean) => {
          setApproveOpen(open)
          if (!open) setActiveContract(null)
        }}
        onApprove={(signedPdfUrl: string) => handleApprove(signedPdfUrl)}
      />
      <ReturnContractModal
        open={returnOpen}
        onOpenChange={(open: boolean) => {
          setReturnOpen(open)
          if (!open) setActiveContract(null)
        }}
        onReturn={(remarks: string) => handleReturn(remarks)}
      />
    </div>
  )
}
