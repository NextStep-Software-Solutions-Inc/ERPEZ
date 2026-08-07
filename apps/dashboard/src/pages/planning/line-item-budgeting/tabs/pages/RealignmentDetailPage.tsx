import { ArrowLeft, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface RealSourceItem {
  id: string
  libId: string
  libName: string
  description: string
  allotmentClass: 'PS' | 'MOOE' | 'CO'
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
  selectedLineItems: Array<{ id: string; description: string; q1: number; q2: number; q3: number; q4: number; total: number; deductAmount: number }>
}

interface RealDestinationItem {
  id: string
  description: string
  allotmentClass: 'PS' | 'MOOE' | 'CO'
  addAmount: number
  targetQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
}

interface RealignmentRequest {
  id: string
  reason: string
  justification: string
  sources: RealSourceItem[]
  destinations: RealDestinationItem[]
  status: 'Draft' | 'Submitted (For Endorsement)' | 'For Budget Review' | 'Approved' | 'Returned for Revision'
  fiscalYear: string
  createdAt: string
  updatedAt?: string
}

interface RealignmentVersion {
  version: number
  status: 'Draft' | 'Submitted (For Endorsement)' | 'For Budget Review' | 'Approved' | 'Returned for Revision'
  totalAmount: number
  timestamp: string
  reviewedBy?: string
  notes?: string
  sources: RealSourceItem[]
  destinations: RealDestinationItem[]
}

interface RealignmentDetailPageProps {
  request: RealignmentRequest | null
  onBack: () => void
}

// Generate mock versions based on request status
const generateVersions = (request: RealignmentRequest): RealignmentVersion[] => {
  const versions: RealignmentVersion[] = []
  const totalAmount = request.sources.reduce((sum, s) => sum + s.total, 0)
  
  // V1 - Draft
  versions.push({
    version: 1,
    status: 'Draft',
    totalAmount: totalAmount * 0.9,
    timestamp: request.createdAt,
    notes: 'Initial draft submission',
    sources: request.sources.map(s => ({ ...s, total: s.total * 0.9 })),
    destinations: request.destinations.map(d => ({ ...d, addAmount: d.addAmount * 0.9 })),
  })

  // V2 - If submitted
  if (request.status !== 'Draft') {
    versions.push({
      version: 2,
      status: 'Submitted (For Endorsement)',
      totalAmount: totalAmount * 0.95,
      timestamp: new Date(new Date(request.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Submitted for endorsement',
      sources: request.sources.map(s => ({ ...s, total: s.total * 0.95 })),
      destinations: request.destinations.map(d => ({ ...d, addAmount: d.addAmount * 0.95 })),
    })
  }

  // V3 - If under review or approved
  if (request.status === 'For Budget Review' || request.status === 'Approved' || request.status === 'Returned for Revision') {
    versions.push({
      version: 3,
      status: request.status === 'Returned for Revision' ? 'Returned for Revision' : 'For Budget Review',
      totalAmount: totalAmount,
      timestamp: new Date(new Date(request.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: 'Budget Review Committee',
      notes: request.status === 'Returned for Revision' ? 'Requested revisions on line items' : 'Under budget review',
      sources: request.sources,
      destinations: request.destinations,
    })
  }

  // V4 - If approved
  if (request.status === 'Approved') {
    versions.push({
      version: 4,
      status: 'Approved',
      totalAmount: totalAmount,
      timestamp: new Date(new Date(request.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: 'Budget Officer',
      notes: 'Approved and finalized',
      sources: request.sources,
      destinations: request.destinations,
    })
  }

  return versions
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Draft':
      return 'bg-slate-100 text-slate-700 border-slate-300'
    case 'Submitted (For Endorsement)':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'For Budget Review':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'Approved':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'Returned for Revision':
      return 'bg-red-100 text-red-700 border-red-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'Draft':
      return 'bg-slate-100 text-slate-800'
    case 'Submitted (For Endorsement)':
      return 'bg-blue-100 text-blue-800'
    case 'For Budget Review':
      return 'bg-yellow-100 text-yellow-800'
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Returned for Revision':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RealignmentDetailPage({ request, onBack }: RealignmentDetailPageProps) {
  const [expandedVersions, setExpandedVersions] = useState<number[]>([])
  
  if (!request) return null

  const versions = generateVersions(request)
  const totalDeduct = request.sources.reduce((sum, s) => sum + s.total, 0)
  const totalAdd = request.destinations.reduce((sum, d) => sum + d.addAmount, 0)
  const balance = totalDeduct - totalAdd

  const toggleVersionExpand = (versionNumber: number) => {
    setExpandedVersions(prev =>
      prev.includes(versionNumber)
        ? prev.filter(v => v !== versionNumber)
        : [...prev, versionNumber]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{request.id}</h1>
                <p className="text-sm text-slate-500 mt-1">Fiscal Year: {request.fiscalYear}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadgeColor(request.status)}>
                {request.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Realignment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Realignment Information</h2>
              
              <div className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">Reason for Realignment</label>
                  <p className="text-base text-slate-900 mt-2">{request.reason}</p>
                </div>

                {/* Justification */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">Justification</label>
                  <p className="text-base text-slate-900 mt-2 whitespace-pre-wrap">{request.justification}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div>
                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created At
                    </label>
                    <p className="text-sm text-slate-700 mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {request.updatedAt && (
                    <div>
                      <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last Updated
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(request.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Summary Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Amount Summary
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-600 font-semibold">Total Deduction</p>
                  <p className="text-2xl font-bold text-red-700 mt-2">₱{totalDeduct.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-semibold">Total Addition</p>
                  <p className="text-2xl font-bold text-green-700 mt-2">₱{totalAdd.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg p-4 border ${balance === 0 ? 'bg-slate-50 border-slate-200' : balance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`text-sm font-semibold ${balance === 0 ? 'text-slate-600' : balance > 0 ? 'text-orange-600' : 'text-blue-600'}`}>Balance</p>
                  <p className={`text-2xl font-bold mt-2 ${balance === 0 ? 'text-slate-700' : balance > 0 ? 'text-orange-700' : 'text-blue-700'}`}>₱{balance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Status & Versions Section */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Version History & Details</h3>
                  </div>
                  
                  {versions.map((version) => {
                    const isExpanded = expandedVersions.includes(version.version)
                    const versionTotalDeduct = version.sources.reduce((sum, s) => sum + s.total, 0)
                    const versionTotalAdd = version.destinations.reduce((sum, d) => sum + d.addAmount, 0)
                    
                    return (
                      <div key={version.version} className={`border rounded-lg overflow-hidden ${getStatusColor(version.status)}`}>
                        {/* Version Header */}
                        <div
                          className="p-4 cursor-pointer hover:opacity-80 transition-opacity flex items-start justify-between gap-4"
                          onClick={() => toggleVersionExpand(version.version)}
                        >
                          <div className="flex-1 flex items-start gap-3">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 mt-1 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-bold">V{version.version}</span>
                                <Badge className={getStatusBadgeColor(version.status)}>
                                  {version.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {new Date(version.timestamp).toLocaleString()}
                              </p>
                              {version.reviewedBy && (
                                <p className="text-sm text-slate-600 mb-2">
                                  <span className="font-semibold">Reviewed by:</span> {version.reviewedBy}
                                </p>
                              )}
                              {version.notes && (
                                <p className="text-sm font-medium text-slate-800">{version.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                            <p className="text-xl font-bold font-mono text-slate-900">
                              ₱{version.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Version Details - Expandable */}
                        {isExpanded && (
                          <div className="border-t border-current bg-white/50 p-4 space-y-6">
                            {/* Sources for this version */}
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-3 text-sm">Sources</h4>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-slate-200 bg-slate-50">
                                      <TableHead className="text-xs text-slate-700">Item ID</TableHead>
                                      <TableHead className="text-xs text-slate-700">Description</TableHead>
                                      <TableHead className="text-xs text-slate-700">Allotment Class</TableHead>
                                      <TableHead className="text-right text-xs text-slate-700">Current Balance</TableHead>
                                      <TableHead className="text-right text-xs text-slate-700">Deduct Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {version.sources.map((source) => (
                                      <TableRow key={source.id} className="border-b border-slate-200 hover:bg-slate-50 text-sm">
                                        <TableCell className="font-medium text-slate-900">{source.id}</TableCell>
                                        <TableCell className="text-slate-700">{source.description}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="border-slate-300 text-slate-700">{source.allotmentClass}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-700">
                                          ₱{source.total.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold text-red-700">
                                          ₱{source.total.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                                      <TableCell colSpan={4} className="text-right text-slate-900 text-sm">Total:</TableCell>
                                      <TableCell className="text-right font-mono text-red-700">
                                        ₱{versionTotalDeduct.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            {/* Destinations for this version */}
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-3 text-sm">Destinations</h4>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-slate-200 bg-slate-50">
                                      <TableHead className="text-xs text-slate-700">Item ID</TableHead>
                                      <TableHead className="text-xs text-slate-700">Description</TableHead>
                                      <TableHead className="text-xs text-slate-700">Allotment Class</TableHead>
                                      <TableHead className="text-xs text-slate-700">Target Quarter</TableHead>
                                      <TableHead className="text-right text-xs text-slate-700">Add Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {version.destinations.map((destination) => (
                                      <TableRow key={destination.id} className="border-b border-slate-200 hover:bg-slate-50 text-sm">
                                        <TableCell className="font-medium text-slate-900">{destination.id}</TableCell>
                                        <TableCell className="text-slate-700">{destination.description}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="border-slate-300 text-slate-700">{destination.allotmentClass}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="border-slate-300 text-slate-700">{destination.targetQuarter}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold text-green-700">
                                          ₱{destination.addAmount.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow className="bg-slate-100 font-semibold border-t-2 border-slate-300">
                                      <TableCell colSpan={4} className="text-right text-slate-900 text-sm">Total:</TableCell>
                                      <TableCell className="text-right font-mono text-green-700">
                                        ₱{versionTotalAdd.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            {/* Version Summary */}
                            <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4">
                              <div className="bg-red-50 rounded p-3 border border-red-200">
                                <p className="text-xs text-red-600 font-semibold">Total Deduction</p>
                                <p className="text-lg font-bold text-red-700 mt-1">₱{versionTotalDeduct.toLocaleString()}</p>
                              </div>
                              <div className="bg-green-50 rounded p-3 border border-green-200">
                                <p className="text-xs text-green-600 font-semibold">Total Addition</p>
                                <p className="text-lg font-bold text-green-700 mt-1">₱{versionTotalAdd.toLocaleString()}</p>
                              </div>
                              <div className={`rounded p-3 border ${(versionTotalDeduct - versionTotalAdd) === 0 ? 'bg-slate-50 border-slate-200' : (versionTotalDeduct - versionTotalAdd) > 0 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                                <p className={`text-xs font-semibold ${(versionTotalDeduct - versionTotalAdd) === 0 ? 'text-slate-600' : (versionTotalDeduct - versionTotalAdd) > 0 ? 'text-orange-600' : 'text-blue-600'}`}>Balance</p>
                                <p className={`text-lg font-bold mt-1 ${(versionTotalDeduct - versionTotalAdd) === 0 ? 'text-slate-700' : (versionTotalDeduct - versionTotalAdd) > 0 ? 'text-orange-700' : 'text-blue-700'}`}>₱{(versionTotalDeduct - versionTotalAdd).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
            </div>
          </div>

          {/* Right Column - Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Fiscal Year</label>
                  <p className="text-base font-medium text-slate-900 mt-1">{request.fiscalYear}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">Status</label>
                  <p className="mt-1">
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {request.status}
                    </Badge>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <label className="text-sm font-semibold text-slate-600">Total Deduction</label>
                  <p className="text-xl font-bold text-red-700 mt-1">₱{totalDeduct.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">Total Addition</label>
                  <p className="text-xl font-bold text-green-700 mt-1">₱{totalAdd.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">Balance</label>
                  <p className={`text-xl font-bold mt-1 ${balance === 0 ? 'text-slate-900' : balance > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                    ₱{balance.toLocaleString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <label className="text-sm font-semibold text-slate-600">Current Version</label>
                  <p className="text-base font-medium text-slate-900 mt-1">V{versions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
