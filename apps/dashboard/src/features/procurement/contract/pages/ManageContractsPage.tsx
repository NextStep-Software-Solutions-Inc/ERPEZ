import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Eye,
  CheckCircle,
  CornerDownLeft,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Search as SearchIcon,
  FileSignature,
} from 'lucide-react'
import { ContractDetailsPage } from '../components/ContractDetailsPage'
import { ApproveContractModal } from '../components/ApproveContractModal'
import { ReturnContractModal } from '../components/ReturnContractModal'
import { useToast } from '@/components/ui/use-toast'
import DebouncedInput from '@/components/DebouncedInput'
import {
  useGetContracts,
  useGetContractSummary,
  useApproveContract,
  useReturnContract,
} from '../handlers/hooks'

/** Normalize backend Pascal-case status to lowercase-kebab display string */
function normalizeStatus(raw: string): string {
  return raw.toLowerCase().replace('forapproval', 'for-approval')
}

export function ManageContractsPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const getUrlContractId = () => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('contractId') || params.get('id')
  }

  const [viewing, setViewingState] = useState<string | null>(() => getUrlContractId())

  const setViewing = (id: string | null) => {
    setViewingState(id)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (id) {
        url.searchParams.set('contractId', id)
      } else {
        url.searchParams.delete('contractId')
        url.searchParams.delete('id')
      }
      window.history.pushState(null, '', url.toString())
    }
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setViewingState(getUrlContractId())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const [page, setPage] = useState(1)
  const pageSize = 8

  // For modals
  const [approveOpen, setApproveOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [activeContractId, setActiveContractId] = useState<string | null>(null)

  // Fetch contracts with ForApproval, Approved, Returned statuses via search
  // We use the list endpoint without a single status filter and filter client-side
  // (the backend supports multi-status via the Filters sieve parameter if needed)
  const { data: contractsData, isLoading } = useGetContracts({
    pageNumber: page,
    pageSize,
    search: search || undefined,
  })

  const { data: summaryData } = useGetContractSummary()

  const approveMutation = useApproveContract()
  const returnMutation = useReturnContract()

  const allContracts = contractsData?.data?.items ?? []
  // Filter to only the statuses relevant to the approving authority view
  const displayContracts = allContracts.filter((c) => {
    const s = normalizeStatus(c.status)
    return s === 'for-approval' || s === 'approved' || s === 'returned'
  })

  const totalCount = contractsData?.data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Reset page when search changes
  useEffect(() => { setPage(1) }, [search])

  const summary = summaryData ?? {
    total: 0,
    draft: 0,
    forApproval: 0,
    approved: 0,
    executed: 0,
    returned: 0,
    cancelled: 0,
  }

  if (viewing) {
    return (
      <ContractDetailsPage
        contractId={viewing}
        onBack={() => setViewing(null)}
        isManageContracts={true}
      />
    )
  }

  const openApprove = (id: string) => {
    setActiveContractId(id)
    setApproveOpen(true)
  }

  const openReturn = (id: string) => {
    setActiveContractId(id)
    setReturnOpen(true)
  }

  const handleApprove = async (remarks?: string) => {
    if (!activeContractId) return
    try {
      await approveMutation.mutateAsync({ id: activeContractId, payload: remarks ? { remarks } : undefined })
      setApproveOpen(false)
      setActiveContractId(null)
      toast({ title: 'Contract Approved', description: 'Contract has been approved.' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to approve.', variant: 'destructive' })
    }
  }

  const handleReturn = async (remarks: string) => {
    if (!activeContractId) return
    try {
      await returnMutation.mutateAsync({ id: activeContractId, payload: { remarks } })
      setReturnOpen(false)
      setActiveContractId(null)
      toast({ title: 'Contract Returned', description: 'Contract has been returned with remarks.' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to return.', variant: 'destructive' })
    }
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
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Active</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {summary.forApproval + summary.approved + summary.returned}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">For Approval</p>
                    <p className="text-3xl font-bold text-amber-900">{summary.forApproval}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{summary.approved}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Returned</p>
                    <p className="text-3xl font-bold text-red-900">{summary.returned}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4 px-0 pb-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search contract number, description, or supplier"
                value={search}
                onChange={(v) => {
                  setSearch(String(v))
                  setPage(1)
                }}
                className="w-full pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading contracts...
            </div>
          ) : displayContracts.length === 0 ? (
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
                  {displayContracts.map((contract) => {
                    const normalStatus = normalizeStatus(contract.status)
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {contract.contractDate ? new Date(contract.contractDate).toLocaleDateString() : '—'}
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
                          {normalStatus === 'approved' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              APPROVED
                            </Badge>
                          ) : normalStatus === 'returned' ? (
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

                              {normalStatus === 'for-approval' && (
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
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-end px-0 py-4">
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
        onOpenChange={(o) => {
          setApproveOpen(o)
          if (!o) setActiveContractId(null)
        }}
        onApprove={handleApprove}
        isLoading={approveMutation.isPending}
      />
      <ReturnContractModal
        open={returnOpen}
        onOpenChange={(o) => {
          setReturnOpen(o)
          if (!o) setActiveContractId(null)
        }}
        onReturn={handleReturn}
        isLoading={returnMutation.isPending}
      />
    </div>
  )
}
