/**
 * Step 3: Parameter Evaluation Form
 * Evaluates NGPA parameters with recommendations and attachments
 * Uses real API endpoints for parameter settings
 * Location: src/features/planning/market-scoping/forms/
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, Upload, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAtom } from 'jotai'
import { draftMarketScopingAtom, currentFormStepAtom } from '../atoms/marketScopingStateAtom'
import { FILE_UPLOAD_CONFIG } from '../utils/constants'
import { fetchParameterSettings, type ParameterSettingApiResponse } from '../handlers/getParameterSettingsRequest'
import type { ParameterEvaluation, FileAttachment, MarketScopingForm } from '../types/marketScopingTypes'
import type { RawParameterEvaluation } from '../types/marketScopingApiTypes'

type DraftParamItem = ParameterEvaluation | RawParameterEvaluation

interface ParameterEvaluationFormProps {
  onNext: (parameters: ParameterEvaluation[]) => void
  onPrevious: () => void
}

export function ParameterEvaluationForm({ onNext, onPrevious }: ParameterEvaluationFormProps) {
  const [draft] = useAtom(draftMarketScopingAtom)
  const [, setCurrentStep] = useAtom(currentFormStepAtom)
  const { toast } = useToast()
  
  // State for API data and loading
  const [, setParameterSettings] = useState<ParameterSettingApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // State for form parameters
  const [parameters, setParameters] = useState<ParameterEvaluation[]>(draft?.parameters || [])
  const [expandedParam, setExpandedParam] = useState<string | null>(null)

  // Fetch parameter settings on mount & hydrate from draft
  useEffect(() => {
    const loadParameterSettings = async () => {
      setIsLoading(true)
      try {
        const settings = await fetchParameterSettings()
        setParameterSettings(settings)
        
        const draftParams: DraftParamItem[] =
          draft?.parameters ||
          (draft as Partial<MarketScopingForm> & { parameterEvaluations?: RawParameterEvaluation[] })?.parameterEvaluations ||
          []
        const draftedMap = new Map<string, DraftParamItem>()

        draftParams.forEach((param: DraftParamItem) => {
          if ('parameterSettingsId' in param && param.parameterSettingsId) draftedMap.set(param.parameterSettingsId, param)
          if ('parameterId' in param && param.parameterId) draftedMap.set(param.parameterId, param)
          if ('id' in param && param.id) draftedMap.set(param.id as string, param)
          if ('parameterName' in param && param.parameterName) draftedMap.set(param.parameterName.toLowerCase().trim(), param)
          if ('displayName' in param && param.displayName) draftedMap.set(param.displayName.toLowerCase().trim(), param)
        })

        const mergedParameters: ParameterEvaluation[] = settings.map((setting) => {
          const match =
            draftedMap.get(setting.id) ||
            draftedMap.get(setting.name?.toLowerCase()?.trim() || '')

          if (match) {
            let consideredVal = match.considered
            if (consideredVal === undefined && 'isConsidered' in match && match.isConsidered !== undefined) {
              consideredVal = match.isConsidered === true ? 'Yes' : match.isConsidered === false ? 'No' : 'NotApplicable'
            }
            const recommendations = match.recommendations || ('remarks' in match ? match.remarks : '') || ''

            return {
              parameterId: setting.id,
              parameterSettingsId: setting.id,
              parameterName: setting.name,
              displayName: setting.name,
              guidedQuestion: setting.guidedQuestion,
              considered: consideredVal,
              recommendations,
              attachments: match.attachments || [],
            }
          }

          return {
            parameterId: setting.id,
            parameterSettingsId: setting.id,
            parameterName: setting.name,
            displayName: setting.name,
            guidedQuestion: setting.guidedQuestion,
            considered: undefined,
            recommendations: '',
            attachments: [],
          }
        })

        setParameters(mergedParameters)
      } catch (error) {
        console.error('Failed to fetch parameter settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load parameter settings. Please try again.',
          color: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadParameterSettings()
  }, [draft])

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const updateParameter = (
    parameterId: string,
    updates: Partial<ParameterEvaluation>
  ) => {
    setParameters((prev) =>
      prev.map((param) =>
        param.parameterId === parameterId ? { ...param, ...updates } : param
      )
    )
  }

  const addAttachment = (parameterId: string, files: File[]) => {
    setParameters((prev) =>
      prev.map((param) => {
        if (param.parameterId === parameterId) {
          const newAttachments: FileAttachment[] = files.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileSize: file.size,
            fileType: file.type,
            uploadedDate: new Date(),
            rawFile: file,
          }))

          return {
            ...param,
            attachments: [...(param.attachments || []), ...newAttachments],
          }
        }
        return param
      })
    )
  }

  const removeAttachment = (parameterId: string, attachmentId: string) => {
    setParameters((prev) =>
      prev.map((param) =>
        param.parameterId === parameterId
          ? {
              ...param,
              attachments: param.attachments.filter((att) => att.id !== attachmentId),
            }
          : param
      )
    )
  }

  const renameAttachment = (parameterId: string, attachmentId: string, newName: string) => {
    setParameters((prev) =>
      prev.map((param) =>
        param.parameterId === parameterId
          ? {
              ...param,
              attachments: param.attachments.map((att) =>
                att.id === attachmentId ? { ...att, fileName: newName } : att
              ),
            }
          : param
      )
    )
  }

  const incompleteParameters = parameters.filter(
    (p) => !p.considered || !p.recommendations.trim()
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-gray-600">Loading parameter settings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Scoping Results - NGPA Parameters</CardTitle>
          <CardDescription>
            Evaluate each parameter based on your market research findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Parameters Accordion */}
            {parameters.map((parameter, index) => (
              <ParameterCard
                key={parameter.parameterId}
                parameter={parameter}
                isExpanded={expandedParam === parameter.parameterId}
                onToggle={() =>
                  setExpandedParam(
                    expandedParam === parameter.parameterId
                      ? null
                      : parameter.parameterId
                  )
                }
                onUpdateParameter={updateParameter}
                onAddAttachment={addAttachment}
                onRemoveAttachment={removeAttachment}
                onRenameAttachment={renameAttachment}
                index={index + 1}
              />
            ))}

            {/* Validation Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">
                    {parameters.length - incompleteParameters.length} of {parameters.length}{' '}
                    parameters completed
                  </p>
                  {incompleteParameters.length > 0 && (
                    <p className="text-xs text-blue-700 mt-1">
                      Please complete all parameter evaluations before proceeding.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
              <Button
                onClick={() => onNext(parameters)}
                disabled={incompleteParameters.length > 0}
              >
                Next: Review & Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Individual Parameter Card (Expandable)
 */
function ParameterCard({
  parameter,
  isExpanded,
  onToggle,
  onUpdateParameter,
  onAddAttachment,
  onRemoveAttachment,
  onRenameAttachment,
  index,
}: {
  parameter: ParameterEvaluation
  isExpanded: boolean
  onToggle: () => void
  onUpdateParameter: (id: string, updates: Partial<ParameterEvaluation>) => void
  onAddAttachment: (id: string, files: File[]) => void
  onRemoveAttachment: (id: string, attachmentId: string) => void
  onRenameAttachment: (id: string, attachmentId: string, newName: string) => void
  index: number
}) {
  const isAnswered = !!parameter.considered
  const isComplete = isAnswered && parameter.recommendations.trim().length > 0

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isExpanded ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-slate-150 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
            P{index}
          </span>
          <div>
            <h4 className="font-semibold text-sm text-slate-900">{parameter.displayName}</h4>
            <p className="text-xs text-slate-500">{parameter.guidedQuestion}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isComplete ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Completed
            </span>
          ) : isAnswered ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              Needs Findings
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Pending
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-4">
          {/* Considered Radio Group */}
          <div>
            <Label className="text-sm font-medium">Is this parameter applicable/considered? *</Label>
            <RadioGroup
              value={parameter.considered}
              onValueChange={(val) =>
                onUpdateParameter(parameter.parameterId, {
                  considered: val as 'Yes' | 'No' | 'NotApplicable',
                })
              }
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id={`considered-yes-${parameter.parameterId}`} />
                <Label htmlFor={`considered-yes-${parameter.parameterId}`} className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id={`considered-no-${parameter.parameterId}`} />
                <Label htmlFor={`considered-no-${parameter.parameterId}`} className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NotApplicable" id={`considered-na-${parameter.parameterId}`} />
                <Label htmlFor={`considered-na-${parameter.parameterId}`} className="font-normal cursor-pointer">
                  Not Applicable
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Recommendations Text Area */}
          <div>
            <Label htmlFor={`recommendations-${parameter.parameterId}`} className="text-sm font-medium">
              Recommendations & Findings *
            </Label>
            <Textarea
              id={`recommendations-${parameter.parameterId}`}
              value={parameter.recommendations}
              onChange={(e) =>
                onUpdateParameter(parameter.parameterId, { recommendations: e.target.value })
              }
              placeholder="Provide detailed findings and recommendations for this parameter..."
              className="mt-2 min-h-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              {parameter.recommendations.length} characters
            </p>
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Supporting Documents (Optional)</Label>
            <FileUploadDropzone
              parameterId={parameter.parameterId}
              files={parameter.attachments}
              onFilesChange={onAddAttachment}
              onRemoveFile={(fileId) => onRemoveAttachment(parameter.parameterId, fileId)}
              onRenameFile={(fileId, newName) => onRenameAttachment(parameter.parameterId, fileId, newName)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * File Upload Dropzone for Parameters
 */
function FileUploadDropzone({
  parameterId,
  files,
  onFilesChange,
  onRemoveFile,
  onRenameFile,
}: {
  parameterId: string
  files: FileAttachment[]
  onFilesChange: (parameterId: string, files: File[]) => void
  onRemoveFile: (fileId: string) => void
  onRenameFile: (fileId: string, newName: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter((file) =>
      (FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
    )
    if (validFiles.length > 0) {
      onFilesChange(parameterId, validFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    onFilesChange(parameterId, selectedFiles)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
      <p className="text-xs text-gray-700 mb-2">Drop files or click to browse</p>
      <input
        type="file"
        multiple
        accept={FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        id={`file-input-param-${parameterId}`}
      />
      <Label htmlFor={`file-input-param-${parameterId}`} className="cursor-pointer text-primary text-xs">
        Browse
      </Label>

      {files.length > 0 && (
        <div className="mt-3 space-y-2 text-left">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-xs gap-2 shadow-xs">
              <input
                type="text"
                value={file.fileName}
                onChange={(e) => onRenameFile(file.id, e.target.value)}
                className="truncate text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none flex-1 font-medium px-1.5 py-0.5 text-xs"
                placeholder="Click to rename attachment label..."
                title="Click to edit document display name"
              />
              <button
                type="button"
                onClick={() => onRemoveFile(file.id)}
                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
