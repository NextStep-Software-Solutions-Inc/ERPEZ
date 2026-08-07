import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CSVUploadForm } from '@/features/uacs/data-management/forms/CSVUploadForm'

/**
 * Data Management Page
 * 
 * Handles:
 * 1. Bulk Import from CSV/Excel
 * 2. Export functionality
 * 3. Synchronization with external systems
 */
export default function DataManagementPage() {
  return (
    <TabsContent value="data-management" className="space-y-4">
      {/* Code Segment Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
        <p className="text-sm text-gray-600">
          Manage UACS code data through bulk import, export, and synchronization features to ensure your code library is up-to-date and accurate.
        </p>
      </div>

      {/* Sub-tabs for data operations */}
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
        </TabsList>

        {/* Bulk Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <CSVUploadForm />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export UACS Codes</CardTitle>
              <CardDescription>
                Export UACS codes to CSV, Excel, or JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Export Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Segment Type</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>All Segments</option>
                      <option>Funding Source</option>
                      <option>Organization Code</option>
                      <option>Location Code</option>
                      <option>MFO/PAP</option>
                      <option>Object Code</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fiscal Year</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>All Years</option>
                      <option>FY 2026</option>
                      <option>FY 2025</option>
                      <option>FY 2024</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Export Format</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>CSV</option>
                      <option>Excel (.xlsx)</option>
                      <option>JSON</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>All</option>
                      <option>Active Only</option>
                      <option>Inactive Only</option>
                    </select>
                  </div>
                </div>

                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Export
                </Button>

                {/* Recent Exports */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Recent Exports</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between">
                      <span>uacs_funding_sources_2026.csv</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>uacs_object_codes_all.xlsx</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synchronization Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Synchronization</CardTitle>
                  <CardDescription>
                    Sync UACS codes with external systems (e.g., DBM API)
                  </CardDescription>
                </div>
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Last Sync: Successful</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm mt-1">
                      Last synchronized: 2026-01-25 14:30:00
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li>10 records added</li>
                      <li>5 records updated</li>
                      <li>0 errors</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Sync Configuration */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Sync Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-sync enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sync interval</span>
                      <select className="h-8 rounded-md border border-input bg-background px-2 text-sm">
                        <option>Every 24 hours</option>
                        <option>Every 12 hours</option>
                        <option>Every 6 hours</option>
                        <option>Manual only</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Source</span>
                      <span className="text-sm text-muted-foreground">DBM API</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TabsContent>
  )
}
