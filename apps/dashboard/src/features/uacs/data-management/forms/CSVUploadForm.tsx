import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { parseCSV, validateCSVData, generateValidationSummary } from '../utils/csvParser'
import type { ValidationReportItem, CSVParseResult } from '../utils/csvParser'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ValidationReportDialog } from '../dialogs/ValidationReportDialog'

type CodeType = 'fundingSource' | 'organization' | 'location' | 'mfoPap' | 'objectCode'

/**
 * CSV Upload Form Component with Drag & Drop
 */
export function CSVUploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType>('fundingSource')
  const [csvData, setCSVData] = useState<CSVParseResult | null>(null)
  const [validationResults, setValidationResults] = useState<ValidationReportItem[]>([])
  const [showValidationReport, setShowValidationReport] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsProcessing(true)
    try {
      const content = await file.text()
      const parsed = parseCSV(content)

      if (parsed.errors.length > 0) {
        toast.error(`CSV parsing failed: ${parsed.errors[0]}`)
        setIsProcessing(false)
        return
      }

      // Validate data
      const results = validateCSVData(parsed.rows, selectedCodeType)
      const summary = generateValidationSummary(results)

      setCSVData(parsed)
      setValidationResults(results)
      setShowValidationReport(true)

      toast.success(
        `Loaded ${parsed.rows.length} rows: ${summary.valid} valid, ${summary.warnings} warnings, ${summary.errors} errors`
      )
    } catch (error) {
      toast.error('Failed to process file')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    handleDrag(e)
    if (isProcessing) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      processFile(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const codeTypeLabel: Record<CodeType, string> = {
    fundingSource: 'Funding Source',
    organization: 'Organization Code',
    location: 'Location Code',
    mfoPap: 'MFO/PAP Code',
    objectCode: 'Object Code',
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload UACS Codes</CardTitle>
          <CardDescription>
            Upload a CSV file containing UACS codes. The file will be validated before import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Code Type to Import</label>
            <Select value={selectedCodeType} onValueChange={(value) => setSelectedCodeType(value as CodeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundingSource">Funding Source (6 digits)</SelectItem>
                <SelectItem value="organization">Organization Code (12 digits)</SelectItem>
                <SelectItem value="location">Location Code (9 digits)</SelectItem>
                <SelectItem value="mfoPap">MFO/PAP Code (9 digits)</SelectItem>
                <SelectItem value="objectCode">Object Code (10 digits)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CSV Format Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>CSV Format Requirements</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• First row must contain headers: code, name (and optional: description)</li>
                <li>• Code must be numeric and match the required digit length for {codeTypeLabel[selectedCodeType]}</li>
                <li>• Name field is required</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
            />

            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isProcessing ? 'Processing file...' : 'Drop CSV file here or click to browse'}
            </p>
            <p className="text-xs text-gray-500">
              Supported format: .csv (Max size: 10MB)
            </p>
          </div>

          {/* Status Messages */}
          {csvData && validationResults.length > 0 && !showValidationReport && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Ready for Review</AlertTitle>
              <AlertDescription className="text-green-700">
                File has been parsed successfully. Click "Review & Import" to see validation results.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {csvData && validationResults.length > 0 && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCSVData(null)
                  setValidationResults([])
                }}
              >
                Clear
              </Button>
              <Button onClick={() => setShowValidationReport(true)}>
                Review & Import
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Report Dialog */}
      {csvData && validationResults.length > 0 && (
        <ValidationReportDialog
          open={showValidationReport}
          onOpenChange={setShowValidationReport}
          results={validationResults}
          csvData={csvData}
          codeType={selectedCodeType}
          onConfirmImport={() => {
            toast.success('Import started!')
            setCSVData(null)
            setValidationResults([])
            setShowValidationReport(false)
          }}
        />
      )}
    </>
  )
}
