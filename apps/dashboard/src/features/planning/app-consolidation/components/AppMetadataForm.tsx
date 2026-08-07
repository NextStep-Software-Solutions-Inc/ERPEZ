import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface AppMetadataFormProps {
  fiscalYear: number | null
  onUpdate: (metadata: { appName: string; appCode: string }) => void
  initialData?: { appName: string; appCode: string }
}

/**
 * AppMetadataForm Component
 * Collects APP Name and APP Code metadata
 * Required before PPMP selection
 */
export function AppMetadataForm({
  fiscalYear,
  onUpdate,
  initialData,
}: AppMetadataFormProps) {
  const [appName, setAppName] = useState(initialData?.appName || '')
  const [appCode, setAppCode] = useState(initialData?.appCode || '')

  useEffect(() => {
    if (initialData) {
      setAppName(initialData.appName)
      setAppCode(initialData.appCode)
    }
  }, [initialData])

  const handleAppNameChange = (value: string) => {
    setAppName(value)
    onUpdate({ appName: value, appCode })
  }

  const handleAppCodeChange = (value: string) => {
    setAppCode(value)
    onUpdate({ appName, appCode: value })
  }

  const isValid = appName.trim().length > 0 && appCode.trim().length > 0

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">APP Metadata</h3>
      </div>

      <p className="text-sm text-gray-600">
        Provide the basic information for the Annual Procurement Plan. This will
        be used for identification and tracking.
      </p>

      <Card className="p-6 space-y-5">
        {/* Fiscal Year Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Fiscal Year</Label>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded font-semibold text-blue-900">
              {fiscalYear || 'Not selected'}
            </div>
          </div>
        </div>

        {/* APP Name */}
        <div>
          <Label htmlFor="appName" className="text-sm font-medium">
            APP Name <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500 mb-2">
            e.g., "Indicative APP 2024", "Supplemental APP - Q2 2024"
          </p>
          <Input
            id="appName"
            placeholder="Enter APP name"
            value={appName}
            onChange={(e) => handleAppNameChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* APP Code */}
        <div>
          <Label htmlFor="appCode" className="text-sm font-medium">
            APP Code <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500 mb-2">
            e.g., "APP-2024-001", "SAPP-2024-Q2"
          </p>
          <Input
            id="appCode"
            placeholder="Enter APP code"
            value={appCode}
            onChange={(e) => handleAppCodeChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Validation Summary */}
        {!isValid && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ All fields are required to proceed
          </div>
        )}

        {isValid && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            ✓ Metadata complete. Ready to proceed.
          </div>
        )}
      </Card>
    </div>
  )
}
