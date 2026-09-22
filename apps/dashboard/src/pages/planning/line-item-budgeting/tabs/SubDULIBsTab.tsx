/**
 * Sub-DU LIBs Tab
 * Review and Approval of Sub-DU Line-Item Budget Submissions
 * 
 * Features:
 * - View LIBs submitted by Sub-DUs
 * - Review and approve submissions
 * - Reject with remarks
 * - Search and filter submissions
 * - Pagination (10 entries per page)
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useThemeStore } from '@/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search, X, MoreVertical, Eye, CheckCircle2, Circle,
  AlertCircle, Clock, XCircle
} from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'

export interface SubDULIB {
  id: string
  libNumber: string
  libName: string
  subDUName: string
  sourceType: 'OPCR' | 'WFP'
  sourceName: string
  scopeLevel?: 'Activity' | 'Project'
  fiscalYear: string
  totalAmount: number
  status: 'Pending Review' | 'Approved' | 'Rejected'
  submittedAt: string
  submittedBy: string
  remarks?: string
  activities: Activity[]
}

export interface Activity {
  id: string
  name: string
  outputIndicator: string
  outputIndicatorWeight: number
  timelineType: 'Daily' | 'Weekly' | 'Monthly'
  expenditure?: number
}

// Mock data for Sub-DU submissions
const mockSubDULibs: SubDULIB[] = [
  {
    id: 'SUBDU-LIB-001',
    libNumber: 'SUBDU-LIB-2025-001',
    libName: 'Finance Sub-DU LIB 2025',
    subDUName: 'Finance Sub-DU',
    sourceType: 'OPCR',
    sourceName: 'Finance Division OPCR 2024',
    fiscalYear: '2025',
    totalAmount: 402000,
    status: 'Pending Review',
    submittedAt: '2025-01-15',
    submittedBy: 'John Doe',
    activities: [
      {
        id: 'ACT-001',
        name: 'Conduct Financial Audit Program',
        outputIndicator: 'No. of audit reports completed',
        outputIndicatorWeight: 10,
        timelineType: 'Monthly',
        expenditure: 350000,
      },
      {
        id: 'ACT-002',
        name: 'Treasury Management Training',
        outputIndicator: 'No. of personnel trained',
        outputIndicatorWeight: 8,
        timelineType: 'Weekly',
        expenditure: 52000,
      },
    ],
  },
  {
    id: 'SUBDU-LIB-002',
    libNumber: 'SUBDU-LIB-2024-001',
    libName: 'Operations Sub-DU LIB 2024',
    subDUName: 'Operations Sub-DU',
    sourceType: 'WFP',
    sourceName: 'IT Infrastructure Project',
    scopeLevel: 'Activity',
    fiscalYear: '2024',
    totalAmount: 875000,
    status: 'Approved',
    submittedAt: '2024-12-20',
    submittedBy: 'Jane Smith',
    activities: [
      {
        id: 'ACT-003',
        name: 'IT Infrastructure Maintenance',
        outputIndicator: 'No. of systems maintained',
        outputIndicatorWeight: 12,
        timelineType: 'Daily',
        expenditure: 875000,
      },
    ],
  },
  {
    id: 'SUBDU-LIB-003',
    libNumber: 'SUBDU-LIB-2023-001',
    libName: 'HR Sub-DU LIB 2023',
    subDUName: 'HR Sub-DU',
    sourceType: 'WFP',
    sourceName: 'Capacity Building Program',
    scopeLevel: 'Project',
    fiscalYear: '2023',
    totalAmount: 625000,
    status: 'Rejected',
    submittedAt: '2023-12-15',
    submittedBy: 'Mark Johnson',
    remarks: 'Budget allocation exceeds approved ceiling. Please revise and resubmit.',
    activities: [
      {
        id: 'ACT-004',
        name: 'Employee Training Program',
        outputIndicator: 'No. of employees trained',
        outputIndicatorWeight: 15,
        timelineType: 'Monthly',
        expenditure: 625000,
      },
    ],
  },
]

export function SubDULIBsTab() {
  const { theme: themeName } = useThemeStore()

  // Dialog States
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingLib, setViewingLib] = useState<SubDULIB | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedLib, setSelectedLib] = useState<SubDULIB | null>(null)
  const [rejectionRemarks, setRejectionRemarks] = useState('')

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // LIB List State
  const [libs, setLibs] = useState<SubDULIB[]>(mockSubDULibs)

  // Filtered and Searched LIBs
  const allFilteredLibs = useMemo(() => {
    return libs.filter(lib => {
      const matchesSearch = searchQuery === '' ||
        lib.libNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.libName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.subDUName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.sourceName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(lib.status)
      const matchesYear = selectedYear === '' || selectedYear === 'all' || lib.fiscalYear === selectedYear

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [libs, searchQuery, selectedStatuses, selectedYear])

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredLibs.length / ITEMS_PER_PAGE)
  const filteredLibs = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    const endIdx = startIdx + ITEMS_PER_PAGE
    return allFilteredLibs.slice(startIdx, endIdx)
  }, [allFilteredLibs, currentPage])

  // Helper function to format WFP source with scope level
  const getSourceDisplay = (lib: SubDULIB) => {
    if (lib.sourceType === 'WFP' && lib.scopeLevel) {
      return `WFP (${lib.scopeLevel.toLowerCase()} level)`
    }
    return lib.sourceType
  }

  // Calculate Statistics
  const stats = useMemo(() => ({
    total: libs.length,
    pending: libs.filter(l => l.status === 'Pending Review').length,
    approved: libs.filter(l => l.status === 'Approved').length,
    rejected: libs.filter(l => l.status === 'Rejected').length,
    totalBudget: libs.reduce((sum, l) => sum + l.totalAmount, 0),
    years: [...new Set(libs.map(l => l.fiscalYear))].sort().reverse(),
  }), [libs])

  // Toggle Status Filter
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
    setCurrentPage(1)
  }

  // Handle View Details
  const handleViewDetails = (lib: SubDULIB) => {
    setViewingLib(lib)
    setViewDialogOpen(true)
  }

  // Handle Approve
  const handleApprove = (lib: SubDULIB) => {
    setSelectedLib(lib)
    setApproveDialogOpen(true)
  }

  // Handle Reject
  const handleReject = (lib: SubDULIB) => {
    setSelectedLib(lib)
    setRejectDialogOpen(true)
  }

  // Confirm Approval
  const confirmApprove = () => {
    if (!selectedLib) return
    setLibs(libs.map(l =>
      l.id === selectedLib.id
        ? { ...l, status: 'Approved' as const }
        : l
    ))
    setApproveDialogOpen(false)
    setSelectedLib(null)
  }

  // Confirm Rejection
  const confirmReject = () => {
    if (!selectedLib || !rejectionRemarks) return
    setLibs(libs.map(l =>
      l.id === selectedLib.id
        ? { ...l, status: 'Rejected' as const, remarks: rejectionRemarks }
        : l
    ))
    setRejectDialogOpen(false)
    setSelectedLib(null)
    setRejectionRemarks('')
  }

  // Get Status Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get Status Icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return <Clock className="h-4 w-4" />
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div
        className="rounded-xl border p-8 transition-colors"
        style={{
          background: `hsl(var(--primary) / 0.05)`,
          borderColor: `hsl(var(--primary) / 0.2)`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Sub-DU LIBs</h2>
            <p className="text-sm text-gray-500 mt-3">
              Review and approve Line-Item Budget submissions from Sub-DUs
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Budget</p>
              <p className="text-xl font-bold text-gray-900 mt-2">
                ₱{(stats.totalBudget / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by name, Sub-DU, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['Pending Review', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatuses.includes(status)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              {status}
              {status === 'Pending Review' && stats.pending > 0 && (
                <Badge className="ml-2 bg-red-500">{stats.pending}</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-DU LIBs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredLibs.length === 0 ? 'No Submissions Found' : `${filteredLibs.length} Submission${filteredLibs.length !== 1 ? 's' : ''}`}
          </h3>
        </div>

        {filteredLibs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No submissions found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLibs.map((lib) => (
              <div
                key={lib.id}
                className="group bg-white border border-gray-200 border-l-4 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                style={{ borderLeftColor: `hsl(var(--primary))` }}
              >
                <div className="p-6">
                  {/* Top Row - Title and Status */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <h4 className="text-xl font-bold text-gray-900">{lib.libNumber}</h4>
                      </div>
                      <p className="text-sm text-gray-500">
                        {lib.sourceType === 'OPCR' ? '📋' : '📊'} {lib.subDUName} • {lib.sourceName} • FY {lib.fiscalYear}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(lib.status)} font-semibold px-4 py-1.5 gap-1.5 flex items-center`}>
                        {getStatusIcon(lib.status)}
                        {lib.status}
                      </Badge>
                      {lib.status === 'Pending Review' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(lib)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApprove(lib)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(lib)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrencyPHP(lib.totalAmount)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activities</p>
                      <p className="text-lg font-bold text-gray-900">{lib.activities.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</p>
                      <p className="text-lg font-bold text-gray-900">{getSourceDisplay(lib)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted</p>
                      <p className="text-sm font-bold text-gray-900">{lib.submittedAt}</p>
                    </div>
                  </div>

                  {/* Remarks and Actions */}
                  <div className="flex items-center justify-between gap-3">
                    {lib.status === 'Rejected' && lib.remarks && (
                      <div className="flex-1 bg-red-50 border-l-4 border-l-red-500 rounded-r px-4 py-3">
                        <p className="text-red-700 font-medium text-sm">{lib.remarks}</p>
                      </div>
                    )}
                    {lib.status === 'Pending Review' && (
                      <div className="flex gap-2 flex-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(lib)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(lib)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {lib.status === 'Approved' && (
                      <div className="flex-1 bg-green-50 border-l-4 border-l-green-500 rounded-r px-4 py-3">
                        <p className="text-green-700 font-medium text-sm">✓ Approved and added to DU LIBs</p>
                      </div>
                    )}
                    {lib.status !== 'Pending Review' && lib.status !== 'Approved' && lib.status !== 'Rejected' && <div className="flex-1" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {allFilteredLibs.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, allFilteredLibs.length)} of {allFilteredLibs.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 border-gray-200"
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'border border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 px-3 border-gray-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingLib?.libNumber}</DialogTitle>
            <DialogDescription className="text-base">
              Review LIB submission details
            </DialogDescription>
          </DialogHeader>

          {viewingLib && (
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Sub-DU
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {viewingLib.subDUName}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrencyPHP(viewingLib.totalAmount)}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Fiscal Year
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {viewingLib.fiscalYear}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Submitted By
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {viewingLib.submittedBy}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Activities</h3>
                <div className="space-y-2">
                  {viewingLib.activities.map(activity => (
                    <div key={activity.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-600">{activity.outputIndicator}</p>
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        ₱{(activity.expenditure || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this LIB submission from {selectedLib?.subDUName}?
              This will add it to the DU LIBs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedLib?.libNumber}</p>
            <p className="text-sm text-gray-600 mt-1">
              Total Amount: {formatCurrencyPHP(selectedLib?.totalAmount)}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide remarks for rejecting this submission
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">{selectedLib?.libNumber}</p>
              <textarea
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="Enter remarks for rejection..."
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionRemarks('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectionRemarks}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
