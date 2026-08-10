import { FileDown, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ExportReportSectionProps {
  onExport: () => void
}

export function ExportReportSection({ onExport }: ExportReportSectionProps) {
  return (
    <div id="export-report-section" className="border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-green-50/80 to-green-100/40 border-t-4 border-t-green-500">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-sm shadow-lg">
              📊
            </div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <FileText className="w-6 h-6 text-green-600" />
              Export & Reports
            </h2>
            <div className="ml-auto w-12 h-12 bg-green-200/30 rounded-lg flex items-center justify-center">📥</div>
          </div>
        </div>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Download and export the Annual Procurement Plan in various formats for reporting and analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors">
                <div className="flex items-start gap-3">
                  <FileDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">PDF Report</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Download the APP as a formatted PDF document with all details and supporting documents
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors">
                <div className="flex items-start gap-3">
                  <FileDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Excel Export</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Export all procurement items and aggregated data to Excel for analysis and further processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={onExport}
              className="pointer-events-auto cursor-pointer w-full font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md mt-4"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export APP Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
