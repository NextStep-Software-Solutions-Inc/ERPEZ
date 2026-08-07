/**
 * Task 3: Budget Status & Version Control Tab
 * Document Routing, Status Transitions, and Variance Snapshot Versioning
 * 
 * Features:
 * - Status State Machine (Draft → Submitted → For Review → Approved)
 * - Reviewer Modification & Snapshot Trigger
 * - Variance Reporting View
 * - Baseline Lock
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Lock, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BudgetSnapshot {
  version: number
  status: 'Draft' | 'Submitted' | 'For Budget Review' | 'Approved' | 'Returned for Revision'
  requestedAmount: number
  approvedAmount: number
  variance: number
  timestamp: string
  reviewedBy?: string
  notes?: string
}

interface BudgetDocument {
  id: string
  name: string
  status: 'Draft' | 'Submitted' | 'For Budget Review' | 'Approved' | 'Returned for Revision'
  snapshots: BudgetSnapshot[]
  currentVersion: number
}

// Mock data
const mockBudgetDocuments: BudgetDocument[] = [
  {
    id: 'LIB-2024-001',
    name: 'Finance Division Budget 2024',
    status: 'Approved',
    currentVersion: 2,
    snapshots: [
      {
        version: 1,
        status: 'Submitted',
        requestedAmount: 500000,
        approvedAmount: 450000,
        variance: -50000,
        timestamp: '2024-02-15T10:30:00',
        reviewedBy: 'Budget Office',
        notes: 'Reduced travel budget',
      },
      {
        version: 2,
        status: 'Approved',
        requestedAmount: 500000,
        approvedAmount: 450000,
        variance: -50000,
        timestamp: '2024-02-20T14:00:00',
        reviewedBy: 'Agency Head',
        notes: 'Approved as recommended',
      },
    ],
  },
  {
    id: 'LIB-2024-002',
    name: 'HR Division Budget 2024',
    status: 'For Budget Review',
    currentVersion: 1,
    snapshots: [
      {
        version: 1,
        status: 'Submitted',
        requestedAmount: 400000,
        approvedAmount: 400000,
        variance: 0,
        timestamp: '2024-02-18T09:15:00',
        notes: 'Awaiting budget office review',
      },
    ],
  },
  {
    id: 'LIB-2024-003',
    name: 'Operations Division Budget 2024',
    status: 'Draft',
    currentVersion: 1,
    snapshots: [
      {
        version: 1,
        status: 'Draft',
        requestedAmount: 350000,
        approvedAmount: 0,
        variance: 0,
        timestamp: '2024-02-10T16:45:00',
      },
    ],
  },
]

const STATUS_FLOW = [
  { status: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', editable: true },
  { status: 'Submitted', label: 'Submitted (For Endorsement)', color: 'bg-blue-100 text-blue-800', editable: false },
  { status: 'For Budget Review', label: 'For Budget Review', color: 'bg-yellow-100 text-yellow-800', editable: false },
  { status: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-800', editable: false },
  { status: 'Returned for Revision', label: 'Returned for Revision', color: 'bg-red-100 text-red-800', editable: true },
]

export function BudgetStatusTab() {
  const [documents, setDocuments] = useState<BudgetDocument[]>(mockBudgetDocuments)
  const [selectedDocId, setSelectedDocId] = useState<string>(mockBudgetDocuments[0].id)
  const [showVarianceModal, setShowVarianceModal] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  const selectedDoc = documents.find(d => d.id === selectedDocId)
  const currentSnapshot = selectedDoc?.snapshots.find(s => s.version === selectedDoc.currentVersion)

  const getStatusColor = (status: string) => {
    return STATUS_FLOW.find(s => s.status === status)?.color || 'bg-gray-100 text-gray-800'
  }

  const canTransitionStatus = (currentStatus: string, nextStatus: string): boolean => {
    const statusOrder = ['Draft', 'Submitted', 'For Budget Review', 'Approved', 'Returned for Revision']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextIndex = statusOrder.indexOf(nextStatus)
    
    if (currentStatus === 'Returned for Revision') {
      return nextStatus === 'Submitted'
    }
    
    return nextIndex === currentIndex + 1
  }

  const handleTransitionStatus = (docId: string, newStatus: string) => {
    setDocuments(documents.map(doc => {
      if (doc.id === docId) {
        const newSnapshot: BudgetSnapshot = {
          version: doc.currentVersion + 1,
          status: newStatus as any,
          requestedAmount: currentSnapshot?.requestedAmount || 0,
          approvedAmount: newStatus === 'Approved' ? currentSnapshot?.requestedAmount || 0 : currentSnapshot?.approvedAmount || 0,
          variance: 0,
          timestamp: new Date().toISOString(),
        }
        
        return {
          ...doc,
          status: newStatus as any,
          currentVersion: newStatus === 'Approved' ? doc.currentVersion + 1 : doc.currentVersion,
          snapshots: [...doc.snapshots, newSnapshot],
        }
      }
      return doc
    }))
  }

  const handleReturnForRevision = (docId: string) => {
    setDocuments(documents.map(doc => {
      if (doc.id === docId) {
        const newSnapshot: BudgetSnapshot = {
          version: doc.currentVersion + 1,
          status: 'Returned for Revision',
          requestedAmount: currentSnapshot?.requestedAmount || 0,
          approvedAmount: currentSnapshot?.approvedAmount || 0,
          variance: currentSnapshot?.variance || 0,
          timestamp: new Date().toISOString(),
          notes: 'Returned for revision by Budget Office',
        }
        
        return {
          ...doc,
          status: 'Returned for Revision',
          snapshots: [...doc.snapshots, newSnapshot],
        }
      }
      return doc
    }))
  }

  return (
    <div className="space-y-6">
      {/* Status Flow Guide */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Budget Status Workflow</CardTitle>
          <CardDescription>Linear progression through approval stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FLOW.map((item, idx) => (
              <div key={item.status} className="flex items-center gap-2">
                <Badge className={item.color}>
                  {item.label}
                </Badge>
                {idx < STATUS_FLOW.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document List and Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Documents</CardTitle>
          <CardDescription>Track document status and versioning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedDocId === doc.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm">{doc.name}</p>
                <p className="text-xs text-gray-500 mt-1">{doc.id}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <span className="text-xs text-gray-600">v{doc.currentVersion}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDoc && currentSnapshot && (
        <>
          {/* Document Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedDoc.name}</CardTitle>
                  <CardDescription>{selectedDoc.id}</CardDescription>
                </div>
                <Badge className={getStatusColor(selectedDoc.status)}>
                  {selectedDoc.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Current Version</p>
                  <p className="text-2xl font-bold text-gray-800">v{selectedDoc.currentVersion}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Last Updated</p>
                  <p className="text-sm text-gray-800">
                    {new Date(currentSnapshot.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Requested Total</p>
                  <p className="text-lg font-bold text-blue-600">
                    ₱{currentSnapshot.requestedAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Approved Total</p>
                  <p className="text-lg font-bold text-green-600">
                    ₱{currentSnapshot.approvedAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Baseline Lock Alert */}
              {selectedDoc.status === 'Approved' && (
                <Alert className="bg-green-50 border-green-200">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Baseline Locked:</strong> This budget is now the "Current Operating Budget" 
                    and cannot be directly edited. Any future changes must go through the Realignment module.
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Transition Controls */}
              {selectedDoc.status !== 'Approved' && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-medium">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map(item => {
                      const canTransition = canTransitionStatus(selectedDoc.status, item.status)
                      return (
                        <Button
                          key={item.status}
                          variant="outline"
                          disabled={!canTransition}
                          onClick={() => handleTransitionStatus(selectedDocId, item.status)}
                          size="sm"
                        >
                          {item.label}
                        </Button>
                      )
                    })}
                    {selectedDoc.status === 'For Budget Review' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnForRevision(selectedDocId)}
                        className="text-red-600"
                      >
                        Return for Revision
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Variance Report Button */}
              <div className="border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowVarianceModal(true)
                    setSelectedVersion(selectedDoc.currentVersion)
                  }}
                  className="gap-2 w-full"
                >
                  <Eye className="h-4 w-4" />
                  View Variance Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Version History & Snapshots</CardTitle>
              <CardDescription>Track all changes and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDoc.snapshots.map((snapshot) => (
                  <div
                    key={snapshot.version}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVersion === snapshot.version
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVersion(snapshot.version)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Version {snapshot.version}</span>
                        <Badge className={getStatusColor(snapshot.status)}>
                          {snapshot.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(snapshot.timestamp).toLocaleDateString()} {new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Requested</p>
                        <p className="font-bold">₱{snapshot.requestedAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600">Approved</p>
                        <p className="font-bold">₱{snapshot.approvedAmount.toLocaleString()}</p>
                      </div>
                      <div className={`p-2 rounded ${
                        snapshot.variance < 0 ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        <p className="text-xs text-gray-600">Variance</p>
                        <p className={`font-bold ${snapshot.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {snapshot.variance < 0 ? '- ' : '+ '}₱{Math.abs(snapshot.variance).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {snapshot.reviewedBy && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Reviewed by:</strong> {snapshot.reviewedBy}
                      </p>
                    )}
                    {snapshot.notes && (
                      <p className="text-xs text-gray-700 mt-2 italic">
                        {snapshot.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Variance Report Modal Content */}
          {showVarianceModal && selectedVersion && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Variance Report - Version {selectedVersion}</CardTitle>
                  <CardDescription>Side-by-side comparison of requested vs approved amounts</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowVarianceModal(false)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent>
                {selectedVersion === 1 && selectedDoc.snapshots.length > 1 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white">
                          <TableHead>Line Item</TableHead>
                          <TableHead className="text-right">Requested Amount</TableHead>
                          <TableHead className="text-right">Approved Amount</TableHead>
                          <TableHead className="text-right">Variance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Sample Line Item 1</TableCell>
                          <TableCell className="text-right">₱100,000</TableCell>
                          <TableCell className="text-right">₱100,000</TableCell>
                          <TableCell className="text-right text-green-600">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Travel and Training</TableCell>
                          <TableCell className="text-right">₱100,000</TableCell>
                          <TableCell className="text-right">₱50,000</TableCell>
                          <TableCell className="text-right text-red-600">-₱50,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Office Supplies</TableCell>
                          <TableCell className="text-right">₱300,000</TableCell>
                          <TableCell className="text-right">₱300,000</TableCell>
                          <TableCell className="text-right text-green-600">-</TableCell>
                        </TableRow>
                        <TableRow className="bg-gray-100 font-bold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell className="text-right">₱500,000</TableCell>
                          <TableCell className="text-right">₱450,000</TableCell>
                          <TableCell className="text-right text-red-600">-₱50,000</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No variance for this version. This is the initial submission.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
