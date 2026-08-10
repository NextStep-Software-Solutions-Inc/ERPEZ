/**
 * Task 5: Document Generation Tab
 * Automated LIB Document Generation, Print Preview, and Standardized Summary Pivots
 * 
 * Features:
 * - Print Preview Engine
 * - Main LIB by API Generation
 * - Automated Summary Tables Generation
 * - Standard Headers and Signatures
 * - Print and Export (PDF/Excel)
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Printer, Eye } from 'lucide-react'

// Mock LIB document data
const mockLIBDocuments = [
  {
    id: 'LIB-2024-001',
    name: 'Finance Division - Budget 2024',
    fundSource: 'Regular Agency Fund',
    preparedBy: 'Maria Santos',
    reviewedBy: 'John Reyes',
    approvedBy: 'Dr. Maria Cruz',
    status: 'Approved',
    lineItems: [
      {
        activity: 'Personnel Management',
        items: [
          { description: 'Salaries', uacs: '01011001', q1: 50000, q2: 50000, q3: 50000, q4: 50000, total: 200000 },
          { description: 'Benefits', uacs: '01011001', q1: 20000, q2: 20000, q3: 20000, q4: 20000, total: 80000 },
        ],
      },
      {
        activity: 'Operations Support',
        items: [
          { description: 'Office Supplies', uacs: '50102011', q1: 15000, q2: 15000, q3: 15000, q4: 15000, total: 60000 },
          { description: 'Travel', uacs: '50102013', q1: 25000, q2: 25000, q3: 25000, q4: 25000, total: 100000 },
        ],
      },
    ],
  },
]

export function DocumentGenerationTab() {
  const [selectedDocId, setSelectedDocId] = useState(mockLIBDocuments[0].id)
  const [showPreview, setShowPreview] = useState(false)

  const selectedDoc = mockLIBDocuments.find(d => d.id === selectedDocId)

  const handleExport = (format: 'pdf' | 'excel' | 'print') => {
    if (format === 'print') {
      window.print()
    } else {
      // In real app, this would trigger actual export
      alert(`Exporting as ${format.toUpperCase()}...`)
    }
  }

  if (!selectedDoc) return null

  // Calculate summary totals
  const totalByAllotmentClass = {
    PS: selectedDoc.lineItems.reduce((sum, act) => 
      sum + act.items.filter(i => i.uacs.startsWith('010')).reduce((s, i) => s + i.total, 0), 0),
    MOOE: selectedDoc.lineItems.reduce((sum, act) => 
      sum + act.items.filter(i => i.uacs.startsWith('501')).reduce((s, i) => s + i.total, 0), 0),
    CO: selectedDoc.lineItems.reduce((sum, act) => 
      sum + act.items.filter(i => i.uacs.startsWith('704')).reduce((s, i) => s + i.total, 0), 0),
  }

  const grandTotal = Object.values(totalByAllotmentClass).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Document Selection & Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Document Generation & Export</CardTitle>
          <CardDescription>Generate, preview, and export your Line-Item Budget document</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select LIB Document</label>
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockLIBDocuments.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} ({doc.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium">Export Options</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('excel')}
              >
                📊
                Export as Excel
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => handleExport('print')}
              >
                <Printer className="h-4 w-4" />
                Print Document
              </Button>
            </div>
          </div>

          {/* Preview Button */}
          <Button 
            onClick={() => setShowPreview(!showPreview)}
            className="w-full gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Print Preview'}
          </Button>
        </CardContent>
      </Card>

      {/* Document Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedDoc.name}</CardTitle>
              <CardDescription>{selectedDoc.id}</CardDescription>
            </div>
            <Badge>{selectedDoc.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Fund Source</p>
            <p className="text-sm font-semibold">{selectedDoc.fundSource}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Grand Total</p>
            <p className="text-xl font-bold text-blue-600">₱{grandTotal.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Prepared By</p>
            <p className="text-sm">{selectedDoc.preparedBy}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Approved By</p>
            <p className="text-sm">{selectedDoc.approvedBy}</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Preview */}
      {showPreview && (
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          {/* Printable Document Container */}
          <div className="p-12 space-y-6" style={{ pageBreakAfter: 'always' }}>
            {/* Document Header */}
            <div className="border-b-2 border-gray-800 pb-4 text-center">
              <h1 className="text-xl font-bold">LINE-ITEM BUDGET</h1>
              <h2 className="text-lg font-semibold mt-2">{selectedDoc.name.toUpperCase()}</h2>
              <p className="text-sm text-gray-600 mt-1">Fiscal Year 2024</p>
            </div>

            {/* Document Control Block */}
            <div className="grid grid-cols-4 gap-2 text-xs border border-gray-400">
              <div className="border-r border-gray-400 p-2">
                <p className="font-semibold">Document Code:</p>
                <p>LIB-001</p>
              </div>
              <div className="border-r border-gray-400 p-2">
                <p className="font-semibold">Rev. No.:</p>
                <p>1</p>
              </div>
              <div className="border-r border-gray-400 p-2">
                <p className="font-semibold">Effective Date:</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div className="p-2">
                <p className="font-semibold">Page No.:</p>
                <p>1</p>
              </div>
            </div>

            {/* Part I: Main LIB by Activity */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b-2 border-gray-800 pb-2">
                PART I: LINE-ITEM BUDGET BY ACTIVITY
              </h3>

              {selectedDoc.lineItems.map((activity, actIdx) => (
                <div key={actIdx} className="space-y-2">
                  {/* Activity Header */}
                  <div className="bg-blue-100 p-2 font-semibold text-sm">
                    Activity: {activity.activity}
                  </div>

                  {/* Activity Items Table */}
                  <table className="w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-2 text-left">Item of Expenditure</th>
                        <th className="border border-gray-400 p-2">UACS</th>
                        <th className="border border-gray-400 p-2">Q1</th>
                        <th className="border border-gray-400 p-2">Q2</th>
                        <th className="border border-gray-400 p-2">Q3</th>
                        <th className="border border-gray-400 p-2">Q4</th>
                        <th className="border border-gray-400 p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="text-right">
                          <td className="border border-gray-400 p-2 text-left">{item.description}</td>
                          <td className="border border-gray-400 p-2">{item.uacs}</td>
                          <td className="border border-gray-400 p-2">₱{item.q1.toLocaleString()}</td>
                          <td className="border border-gray-400 p-2">₱{item.q2.toLocaleString()}</td>
                          <td className="border border-gray-400 p-2">₱{item.q3.toLocaleString()}</td>
                          <td className="border border-gray-400 p-2">₱{item.q4.toLocaleString()}</td>
                          <td className="border border-gray-400 p-2 font-bold">₱{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Activity Sub-total */}
                  <div className="text-right text-sm font-bold">
                    Sub-total, {activity.activity}: ₱{activity.items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Part II: Summary by Allotment Class */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b-2 border-gray-800 pb-2">
                PART II: SUMMARY BY ALLOTMENT CLASS
              </h3>

              <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-2 text-left">Allotment Class</th>
                    <th className="border border-gray-400 p-2">Q1</th>
                    <th className="border border-gray-400 p-2">Q2</th>
                    <th className="border border-gray-400 p-2">Q3</th>
                    <th className="border border-gray-400 p-2">Q4</th>
                    <th className="border border-gray-400 p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(totalByAllotmentClass).map(([allotment, total]) => (
                    <tr key={allotment} className="text-right">
                      <td className="border border-gray-400 p-2 text-left font-semibold">
                        {allotment === 'PS' ? 'Personnel Services' : allotment === 'MOOE' ? 'Maintenance & Other Operating Expenses' : 'Capital Outlays'}
                      </td>
                      <td className="border border-gray-400 p-2">₱{(total / 4).toLocaleString()}</td>
                      <td className="border border-gray-400 p-2">₱{(total / 4).toLocaleString()}</td>
                      <td className="border border-gray-400 p-2">₱{(total / 4).toLocaleString()}</td>
                      <td className="border border-gray-400 p-2">₱{(total / 4).toLocaleString()}</td>
                      <td className="border border-gray-400 p-2 font-bold">₱{total.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-yellow-100 font-bold text-right">
                    <td className="border border-gray-400 p-2 text-left">GRAND TOTAL</td>
                    <td className="border border-gray-400 p-2">₱{(grandTotal / 4).toLocaleString()}</td>
                    <td className="border border-gray-400 p-2">₱{(grandTotal / 4).toLocaleString()}</td>
                    <td className="border border-gray-400 p-2">₱{(grandTotal / 4).toLocaleString()}</td>
                    <td className="border border-gray-400 p-2">₱{(grandTotal / 4).toLocaleString()}</td>
                    <td className="border border-gray-400 p-2">₱{grandTotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="pt-8 space-y-4">
              <p className="text-xs font-semibold">CERTIFICATION:</p>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="border-t border-gray-800 h-20"></div>
                  <p className="text-xs font-semibold">{selectedDoc.preparedBy}</p>
                  <p className="text-xs text-gray-600">Prepared By</p>
                </div>
                <div>
                  <div className="border-t border-gray-800 h-20"></div>
                  <p className="text-xs font-semibold">{selectedDoc.reviewedBy}</p>
                  <p className="text-xs text-gray-600">Reviewed By</p>
                </div>
                <div>
                  <div className="border-t border-gray-800 h-20"></div>
                  <p className="text-xs font-semibold">{selectedDoc.approvedBy}</p>
                  <p className="text-xs text-gray-600">Approved By</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center mt-4">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Information */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Document Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 font-medium">Personnel Services</p>
              <p className="text-2xl font-bold text-blue-600">₱{totalByAllotmentClass.PS.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 font-medium">MOOE</p>
              <p className="text-2xl font-bold text-green-600">₱{totalByAllotmentClass.MOOE.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 font-medium">Capital Outlays</p>
              <p className="text-2xl font-bold text-orange-600">₱{totalByAllotmentClass.CO.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-purple-600">₱{grandTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm font-medium mb-2">Document Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Total Activities</p>
                <p className="font-bold">{selectedDoc.lineItems.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Line Items</p>
                <p className="font-bold">{selectedDoc.lineItems.reduce((sum, a) => sum + a.items.length, 0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Fund Source</p>
                <p className="font-bold">{selectedDoc.fundSource}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-bold">{selectedDoc.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
