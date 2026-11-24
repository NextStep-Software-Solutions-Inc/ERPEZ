import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, FileText, AlertCircle, DollarSign, Users, CheckCircle2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/app-consolidation/supplemental/$supplementalId'
)({
  component: SupplementalAPPDetailsPage,
})

function SupplementalAPPDetailsPage() {
  const { supplementalId } = Route.useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('metadata')

  // Get supplemental app from location state or use defaults
  const supplementalApp = (location.state as any)?.supplementalApp || {
    id: supplementalId,
    supplementalName: 'Supplemental Annual Procurement Plan No. 1',
    appName: 'General Services and Operating Expenses',
    appCode: 'GSOE-2024',
    appNumber: 'APP-2024-001',
    fiscalYear: 2024,
    deltaItems: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    aggregationResults: {
      items: [],
      totalAmount: 0,
    },
    bac: {
      id: '',
      appId: supplementalId,
      lineItems: [],
      sourceFunds: [],
      totalBudget: 0,
      modeOfProcurements: [],
    },
  }

  // Calculate delta stats
  const deltaStats = {
    totalItems: supplementalApp.deltaItems?.length || 0,
    totalBudget: supplementalApp.deltaItems?.reduce(
      (sum: number, item: any) => sum + (item.deltaAmount || 0),
      0
    ) || 0,
    newItems: supplementalApp.deltaItems?.filter((item: any) => !item.existingQuantity)
      .length || 0,
    modifiedItems:
      (supplementalApp.deltaItems?.filter((item: any) => item.existingQuantity).length || 0) -
      (supplementalApp.deltaItems?.filter((item: any) => !item.existingQuantity).length || 0),
  }

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.App.Manage}
      message="You do not have permission to view Supplemental APP details."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pointer-events-auto relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/v2/app-consolidation' })}
            className="pl-0 hover:bg-transparent pointer-events-auto cursor-pointer relative z-10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to APPs
          </Button>
        </div>

      {/* Supplemental Header Card */}
      <div className="border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-purple-50/80 to-purple-100/40 border-t-4 border-t-purple-500">
        <div className="flex items-start justify-between p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black text-sm shadow-lg">
              ✏️
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{supplementalApp.supplementalName}</h1>
              <p className="text-sm text-gray-600 mt-2">Supplementing: <strong>{supplementalApp.appName}</strong> • {supplementalApp.appCode}</p>
              <code className="text-xs font-mono text-purple-700 mt-2 block">ID: {supplementalId}</code>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium text-sm">
              <AlertCircle className="w-4 h-4" />
              Draft
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Fiscal Year</p>
            <p className="text-3xl font-black text-gray-900 mt-2">FY {supplementalApp.fiscalYear}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Supplemental Budget</p>
            <p className="text-3xl font-black text-green-700 mt-2">₱{(deltaStats.totalBudget / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 font-medium">Delta Items</p>
            <p className="text-3xl font-black text-blue-700 mt-2">{deltaStats.totalItems}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      <Alert className="border-amber-300 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-700" />
        <AlertDescription className="text-amber-800 ml-2">
          You are in <strong>Draft mode</strong>. All changes can be modified until submission. Complete all tabs before final approval.
        </AlertDescription>
      </Alert>

      {/* Tabs Section */}
      <Card className="border-0 rounded-xl overflow-hidden shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <TabsList className="w-full flex gap-0 p-0 h-auto bg-transparent rounded-none border-b-0">
              <TabsTrigger
                value="metadata"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Metadata</span>
              </TabsTrigger>
              <TabsTrigger
                value="delta-items"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <Package className="w-4 h-4" />
                <span>Delta Items</span>
              </TabsTrigger>
              <TabsTrigger
                value="reason"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Reason</span>
              </TabsTrigger>
              <TabsTrigger
                value="bac"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <DollarSign className="w-4 h-4" />
                <span>BAC</span>
              </TabsTrigger>
              <TabsTrigger
                value="signatories"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <Users className="w-4 h-4" />
                <span>Signatories</span>
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="relative rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-white justify-start gap-2 px-6 py-4 font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Review</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="p-6 space-y-4">
            <div className="space-y-4">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Supplemental Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Supplemental Name</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{supplementalApp.supplementalName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Code</p>
                      <p className="text-lg font-mono font-bold text-gray-900 mt-2">{supplementalApp.appCode}-S1</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Original APP</p>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900">{supplementalApp.appName}</p>
                      <p className="text-sm text-gray-600">Code: {supplementalApp.appCode}</p>
                      <p className="text-sm text-gray-600">Fiscal Year: FY {supplementalApp.fiscalYear}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delta Items Tab */}
          <TabsContent value="delta-items" className="p-6 space-y-4">
            <div className="space-y-4">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Delta Items Summary
                  </CardTitle>
                  <CardDescription className="text-green-700">New and modified procurement items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-300 text-center">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Total Delta Items</p>
                      <p className="text-3xl font-black text-green-700 mt-2">{deltaStats.totalItems}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-300 text-center">
                      <p className="text-xs text-gray-600 font-semibold uppercase">New Items</p>
                      <p className="text-3xl font-black text-blue-700 mt-2">{deltaStats.newItems}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-300 text-center">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Modified</p>
                      <p className="text-3xl font-black text-amber-700 mt-2">{Math.abs(deltaStats.modifiedItems)}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Delta Budget</p>
                    <p className="text-3xl font-black text-green-700 mt-2">₱{(deltaStats.totalBudget).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</p>
                  </div>
                  
                  {/* Delta Items Table */}
                  {supplementalApp.deltaItems && supplementalApp.deltaItems.length > 0 ? (
                    <div className="border border-green-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-green-900">Item Code</th>
                            <th className="text-left px-4 py-3 font-semibold text-green-900">Description</th>
                            <th className="text-center px-4 py-3 font-semibold text-green-900">PPMP Source</th>
                            <th className="text-center px-4 py-3 font-semibold text-green-900">Status</th>
                            <th className="text-right px-4 py-3 font-semibold text-green-900">Delta Qty</th>
                            <th className="text-right px-4 py-3 font-semibold text-green-900">Unit Cost</th>
                            <th className="text-right px-4 py-3 font-semibold text-green-900">Delta Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplementalApp.deltaItems.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                              <td className="px-4 py-3 font-mono text-gray-900">{item.code}</td>
                              <td className="px-4 py-3 text-gray-700">{item.description}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                  {item.ppmpLabel || 'PPMP'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.isModified ? (
                                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                    Modified
                                  </span>
                                ) : item.isNewItem ? (
                                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                                    New
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                    Original
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.deltaQuantity?.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-mono text-gray-900">₱{(item.unitCost || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-right font-semibold text-green-700">₱{(item.deltaAmount || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert className="border-blue-300 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-700" />
                      <AlertDescription className="text-blue-800 ml-2">
                        No delta items found. Select amended PPMPs to extract delta items.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reason Tab */}
          <TabsContent value="reason" className="p-6 space-y-4">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Justification for Supplemental Procurement
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Provide the business reason and regulatory justification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-orange-200 min-h-[150px]">
                  <p className="text-sm text-gray-600">No reason provided yet.</p>
                  <p className="text-xs text-gray-500 mt-2">Click Edit to add justification text.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">Edit Reason</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BAC Tab */}
          <TabsContent value="bac" className="p-6 space-y-4">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget and Accounting Code
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Cost allocation and fund source configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-amber-300">
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Total Supplemental Budget: <strong>₱{(deltaStats.totalBudget).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</strong>
                  </AlertDescription>
                </Alert>
                <div className="bg-white rounded-lg p-8 text-center border border-amber-200">
                  <p className="text-gray-600">BAC configuration will be available once delta items are selected.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signatories Tab */}
          <TabsContent value="signatories" className="p-6 space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Signatory Approval
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Configure required approvers and signatories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-300 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-700" />
                  <AlertDescription className="ml-2 text-blue-800">
                    Signatories will be required before final submission.
                  </AlertDescription>
                </Alert>
                <div className="bg-white rounded-lg p-8 text-center border border-blue-200">
                  <p className="text-gray-600">Signatory configuration coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="p-6 space-y-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader>
                <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Review & Submission
                </CardTitle>
                <CardDescription className="text-green-700">
                  Final review before submitting for approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-green-300 bg-white">
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                  <AlertDescription className="ml-2 text-green-800">
                    Complete all sections before submitting for approval.
                  </AlertDescription>
                </Alert>

                {/* Pre-Submission Checklist */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Pre-Submission Checklist</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Metadata completed', checked: false },
                      { label: 'Delta items selected', checked: false },
                      { label: 'Reason provided', checked: false },
                      { label: 'BAC configured', checked: false },
                      { label: 'Signatories assigned', checked: false },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-colors"
                      >
                        <input type="checkbox" checked={item.checked} disabled className="w-5 h-5 rounded" />
                        <span className={item.checked ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-6 flex gap-2">
                  <Button variant="outline" className="flex-1 border-gray-300">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled>
                    Submit for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
    </RoutePermissionGuard>
  )
}
