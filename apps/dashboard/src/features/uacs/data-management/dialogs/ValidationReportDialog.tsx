import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ValidationReportItem, CSVParseResult } from '../utils/csvParser'
import { generateValidationSummary } from '../utils/csvParser'

interface ValidationReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: ValidationReportItem[]
  csvData: CSVParseResult
  codeType: string
  onConfirmImport: () => void
}

/**
 * Validation Report Dialog
 * Displays detailed validation results with options to handle errors/warnings
 */
export function ValidationReportDialog({
  open,
  onOpenChange,
  results,
  csvData,
  codeType,
  onConfirmImport,
}: ValidationReportDialogProps) {
  const summary = generateValidationSummary(results)
  const warningRecords = results.filter((r) => r.status === 'warning')
  const errorRecords = results.filter((r) => r.status === 'error')

  const codeTypeLabel: Record<string, string> = {
    fundingSource: 'Funding Source',
    organization: 'Organization Code',
    location: 'Location Code',
    mfoPap: 'MFO/PAP Code',
    objectCode: 'Object Code',
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Import Validation Report</AlertDialogTitle>
          <AlertDialogDescription>
            {codeTypeLabel[codeType]} - {csvData.rows.length} records
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{summary.total}</div>
              <div className="text-sm text-blue-700">Total Records</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-900">{summary.valid}</div>
              <div className="text-sm text-green-700">Valid</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">{summary.warnings}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-900">{summary.errors}</div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {/* Status Alert */}
          {summary.canImport ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {summary.errors === 0 && summary.warnings === 0
                  ? 'All records are valid and ready to import.'
                  : `${summary.valid} valid record(s) ready to import. ${summary.warnings} warning(s) will be imported with flags.`}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {summary.errors} error(s) found. Please fix these before importing.
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Results Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({results.length})</TabsTrigger>
              <TabsTrigger value="warnings" className="text-yellow-700">
                Warnings ({warningRecords.length})
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-red-700">
                Errors ({errorRecords.length})
              </TabsTrigger>
            </TabsList>

            {/* All Records */}
            <TabsContent value="all" className="space-y-3">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">Row</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{result.row}</TableCell>
                        <TableCell className="font-mono font-medium">{result.code || '-'}</TableCell>
                        <TableCell className="text-sm">{result.name || '-'}</TableCell>
                        <TableCell>
                          {result.status === 'valid' && (
                            <Badge className="bg-green-100 text-green-800">Valid</Badge>
                          )}
                          {result.status === 'warning' && (
                            <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                          )}
                          {result.status === 'error' && (
                            <Badge className="bg-red-100 text-red-800">Error</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.message && <span className="line-clamp-2">{result.message}</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Warnings Only */}
            <TabsContent value="warnings" className="space-y-3">
              {warningRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No warnings found
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-yellow-50">
                        <TableHead className="w-12">Row</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Warning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warningRecords.map((result, index) => (
                        <TableRow key={index} className="hover:bg-yellow-50">
                          <TableCell className="font-mono text-sm">{result.row}</TableCell>
                          <TableCell className="font-mono font-medium">{result.code}</TableCell>
                          <TableCell className="text-sm">{result.name}</TableCell>
                          <TableCell className="text-sm text-yellow-700">{result.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Errors Only */}
            <TabsContent value="errors" className="space-y-3">
              {errorRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No errors found
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead className="w-12">Row</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorRecords.map((result, index) => (
                        <TableRow key={index} className="hover:bg-red-50">
                          <TableCell className="font-mono text-sm">{result.row}</TableCell>
                          <TableCell className="font-mono font-medium">{result.code || '-'}</TableCell>
                          <TableCell className="text-sm">{result.name || '-'}</TableCell>
                          <TableCell className="text-sm text-red-700">{result.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Import Options (if errors present) */}
          {!summary.canImport && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You can still import valid and warning records by skipping the error rows.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {summary.canImport && (
            <AlertDialogAction onClick={onConfirmImport} className="bg-green-600 hover:bg-green-700">
              Confirm & Import {summary.valid || summary.warnings > 0 ? `(${summary.valid + summary.warnings} records)` : ''}
            </AlertDialogAction>
          )}
          {!summary.canImport && summary.valid + summary.warnings > 0 && (
            <AlertDialogAction onClick={onConfirmImport} className="bg-amber-600 hover:bg-amber-700">
              Skip Errors & Import {summary.valid + summary.warnings} Valid Records
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
