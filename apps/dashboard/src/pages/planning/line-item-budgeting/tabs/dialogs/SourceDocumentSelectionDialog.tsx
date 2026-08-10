import { useState, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { HelpCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface SourceDocument {
  id: string
  code: string
  name: string
  status: 'Approved' | 'Pending' | 'Rejected'
  office: string
  type: 'OPCR' | 'WFP'
  fiscalYear: string
  projectName?: string
}

interface SourceDocumentSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: {
    sourceType: 'OPCR' | 'WFP'
    sourceId: string
    sourceName: string
    scopeLevel: 'Activity' | 'Project'
  }) => void
  fiscalYear?: string
}

export function SourceDocumentSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  fiscalYear = '',
}: SourceDocumentSelectionDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSourceType, setSelectedSourceType] = useState<
    'OPCR' | 'WFP' | null
  >(null)
  const [selectedDocument, setSelectedDocument] =
    useState<SourceDocument | null>(null)
  const [activityLevelEnabled, setActivityLevelEnabled] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock OPCR documents
  const mockOPCRs: SourceDocument[] = [
    {
      id: 'OPCR-2024-001',
      code: 'OPCR-2024-001',
      name: 'Finance Division OPCR 2024',
      status: 'Approved',
      office: 'Finance Division',
      type: 'OPCR',
      fiscalYear: '2024',
    },
    {
      id: 'OPCR-2024-002',
      code: 'OPCR-2024-002',
      name: 'Budget Management OPCR 2024',
      status: 'Approved',
      office: 'Finance Division',
      type: 'OPCR',
      fiscalYear: '2024',
    },
    {
      id: 'OPCR-2025-001',
      code: 'OPCR-2025-001',
      name: 'Finance Division OPCR 2025',
      status: 'Approved',
      office: 'Finance Division',
      type: 'OPCR',
      fiscalYear: '2025',
    },
    {
      id: 'OPCR-2025-002',
      code: 'OPCR-2025-002',
      name: 'Planning OPCR 2025',
      status: 'Approved',
      office: 'Finance Division',
      type: 'OPCR',
      fiscalYear: '2025',
    },
    {
      id: 'OPCR-2026-001',
      code: 'OPCR-2026-001',
      name: 'Finance Division OPCR 2026',
      status: 'Approved',
      office: 'Finance Division',
      type: 'OPCR',
      fiscalYear: '2026',
    },
  ]

  // Mock WFP documents
  const mockWFPs: SourceDocument[] = [
    {
      id: 'WFP-2024-001',
      code: 'WFP-2024-001',
      name: 'IT Infrastructure Upgrade',
      status: 'Approved',
      office: 'Finance Division',
      type: 'WFP',
      fiscalYear: '2024',
      projectName: 'IT Infrastructure Upgrade',
    },
    {
      id: 'WFP-2024-002',
      code: 'WFP-2024-002',
      name: 'Office Renovation Program',
      status: 'Approved',
      office: 'Finance Division',
      type: 'WFP',
      fiscalYear: '2024',
      projectName: 'Office Renovation Program',
    },
    {
      id: 'WFP-2025-001',
      code: 'WFP-2025-001',
      name: 'System Modernization Project',
      status: 'Approved',
      office: 'Finance Division',
      type: 'WFP',
      fiscalYear: '2025',
      projectName: 'System Modernization Project',
    },
    {
      id: 'WFP-2025-002',
      code: 'WFP-2025-002',
      name: 'Capacity Building Initiative',
      status: 'Approved',
      office: 'Finance Division',
      type: 'WFP',
      fiscalYear: '2025',
      projectName: 'Capacity Building Initiative',
    },
    {
      id: 'WFP-2026-001',
      code: 'WFP-2026-001',
      name: 'Digital Transformation Program',
      status: 'Approved',
      office: 'Finance Division',
      type: 'WFP',
      fiscalYear: '2026',
      projectName: 'Digital Transformation Program',
    },
  ]

  // Filter documents by fiscal year
  const filteredOPCRs = mockOPCRs.filter(
    (doc) => doc.fiscalYear === fiscalYear && doc.status === 'Approved',
  )

  const filteredWFPs = mockWFPs.filter(
    (doc) => doc.fiscalYear === fiscalYear && doc.status === 'Approved',
  )

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedSourceType(null)
      setSelectedDocument(null)
      setActivityLevelEnabled(false)
      setErrors({})
    }
  }, [open])

  // Auto-select OPCR's path to Activity-Level (no toggle for OPCR)
  useEffect(() => {
    if (selectedSourceType === 'OPCR') {
      setActivityLevelEnabled(true)
    } else if (selectedSourceType === 'WFP') {
      setActivityLevelEnabled(false)
    }
  }, [selectedSourceType])

  const validateSelection = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedSourceType) {
      newErrors.sourceType = 'Please select OPCR or WFP'
    }

    if (!selectedDocument) {
      newErrors.document = 'Please select a document'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateSelection() || !selectedDocument) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const scopeLevel =
        selectedSourceType === 'OPCR' || activityLevelEnabled
          ? 'Activity'
          : 'Project'

      if (selectedSourceType) {
        onSelect({
          sourceType: selectedSourceType,
          sourceId: selectedDocument.id,
          sourceName: selectedDocument.name,
          scopeLevel: scopeLevel as 'Activity' | 'Project',
        })
      }

      toast({
        title: 'Source Document Selected',
        description: `${selectedSourceType} document selected. Proceeding to Step 3.`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select source document. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Select Source Document for LIB"
    >
      <div className="w-full space-y-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          Choose between OPCR or WFP. Source documents are filtered by Fiscal
          Year {fiscalYear}.
        </p>

        {/* Step Indicator */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            ② Source Document Selection
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
            Select your planning source document
          </p>
        </div>

        {/* No Documents Available Warning */}
        {filteredOPCRs.length === 0 && filteredWFPs.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">No documents available</p>
              <p className="mt-1">
                There are no approved OPCR or WFP documents for Fiscal Year{' '}
                {fiscalYear}.
              </p>
            </div>
          </div>
        )}

        {/* Documents Selection */}
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Available Documents for Fiscal Year {fiscalYear}:
          </p>

          {/* OPCR Documents */}
          <div className="space-y-2">
            {filteredOPCRs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedSourceType('OPCR')
                  setSelectedDocument(doc)
                }}
                className={cn(
                  'w-full text-left p-4 border rounded-lg transition-all',
                  selectedDocument?.id === doc.id &&
                    selectedSourceType === 'OPCR'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        selectedDocument?.id === doc.id &&
                          selectedSourceType === 'OPCR'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600',
                      )}
                    >
                      {selectedDocument?.id === doc.id &&
                        selectedSourceType === 'OPCR' && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      OPCR - Office Performance Commitment and Review
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Document:</span>{' '}
                        {doc.code}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                          Approved
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Office:</span>{' '}
                        {doc.office}
                      </div>
                    </div>
                    {selectedDocument?.id === doc.id &&
                      selectedSourceType === 'OPCR' && (
                        <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900 rounded border border-blue-300 dark:border-blue-700">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <span className="font-medium">Path:</span>{' '}
                            Activity-Level Breakdown (automatically selected for
                            OPCR)
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* WFP Documents */}
          <div className="space-y-2">
            {filteredWFPs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedSourceType('WFP')
                  setSelectedDocument(doc)
                }}
                className={cn(
                  'w-full text-left p-4 border rounded-lg transition-all',
                  selectedDocument?.id === doc.id &&
                    selectedSourceType === 'WFP'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        selectedDocument?.id === doc.id &&
                          selectedSourceType === 'WFP'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600',
                      )}
                    >
                      {selectedDocument?.id === doc.id &&
                        selectedSourceType === 'WFP' && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">WFP - Work and Financial Plan</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Document:</span>{' '}
                        {doc.code}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                          Approved
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Project:</span>{' '}
                        {doc.projectName}
                      </div>
                    </div>
                    {selectedDocument?.id === doc.id &&
                      selectedSourceType === 'WFP' && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded border border-amber-300 dark:border-amber-700">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Activity-Level: Break down line items by
                                    activities. Project-Level: Direct line item
                                    entry without activity nesting.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              Enable Activity-Level Breakdown?
                            </p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActivityLevelEnabled(true)
                                }}
                                className={cn(
                                  'px-3 py-1 text-xs rounded font-medium transition-all',
                                  activityLevelEnabled
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                                )}
                              >
                                Yes (Path A)
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActivityLevelEnabled(false)
                                }}
                                className={cn(
                                  'px-3 py-1 text-xs rounded font-medium transition-all',
                                  !activityLevelEnabled
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                                )}
                              >
                                No (Path B)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Please complete all required fields:
            </p>
            <ul className="mt-2 space-y-1">
              {Object.entries(errors).map(([key, message]) => (
                <li
                  key={key}
                  className="text-sm text-red-800 dark:text-red-200"
                >
                  • {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading || !selectedDocument}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Step 3
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
