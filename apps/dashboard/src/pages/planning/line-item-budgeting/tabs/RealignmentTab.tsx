import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RealignmentRequestsTab } from './RealignmentRequestsTab'
import { CreateLIBAmendmentDialog } from '@/features/planning/line-item-budgeting/realignment/dialogs/CreateLIBAmendmentDialog'
import { useToast } from '@/components/ui/use-toast'
import {
  Layers,
  ActivityIcon,
} from 'lucide-react'
import { Accordion } from '@/components/ui/accordion'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
  buildEndpoint,
} from 'erpez-shared-lib'
import { generateLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/generateLIBDocumentRequest'
import { downloadLIBDocumentRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/downloadLIBDocumentRequest'

// Import feature realignment components, store, constants & helpers
import { useRealignmentStore } from '@/features/planning/line-item-budgeting/realignment/store/realignmentStore'
import {
  VersionHistoryPanel,
  RealignmentAccordionItem,
} from '@/features/planning/line-item-budgeting/realignment/components'
import {
  exportToCSV,
} from '@/features/planning/line-item-budgeting/realignment/utils/realignmentExport'
import {
  currentFiscalYear,
} from '@/features/planning/line-item-budgeting/realignment/constants/realignmentConstants'
import { useLIBs } from '@/features/planning/line-item-budgeting/realignment/hooks/useLIBQueries'
import { useLIBAmendments } from '@/features/planning/line-item-budgeting/realignment/hooks/useLIBAmendments'
import { useRealignmentPdf } from '@/features/planning/line-item-budgeting/realignment'
import {
  adaptApiActivitiesToFrontend,
  adaptApiOrphansToProjectGroups,
} from '@/features/planning/line-item-budgeting/realignment/utils/realignmentMapper'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import type { LIB, LIBActivity } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { getLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBRequest'
import { getLIBActivitiesRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBActivitiesRequest'
import { getOPCRRequest } from '@/features/planning/opcr/handlers/getOPCRRequest'
import { getWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPRequest'
import { getLineItemBudgetDetailsRequest } from '@/features/planning/line-item-budgeting/line-item-budget-details/hooks/getLineItemBudgetDetailsRequest'
import { Skeleton } from '@/components/ui/skeleton'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useGenerateLIBDocument = createMutationHookFromTemplate(
  generateLIBDocumentRequest,
)
const useDownloadLIBDocument = createMutationHookFromTemplate(
  downloadLIBDocumentRequest,
)

export function RealignmentTab() {
  const navigate = useNavigate({ from: '/v2/line-item-budgeting' })
  const search = useSearch({ from: '/v2/line-item-budgeting' })
  const { toast } = useToast()
  const { mutateAsync: generateLIBDocument } = useGenerateLIBDocument()
  const { mutateAsync: downloadLIBDocument } = useDownloadLIBDocument()
  const { downloadPdf: downloadRealignmentPdf } = useRealignmentPdf()

  // 1. Fetch Fiscal Years
  const { data: fiscalYearsData } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const sortedFiscalYears = useMemo(() => {
    const raw = fiscalYearsData?.data || []
    return [...raw].sort((a, b) => a.year - b.year)
  }, [fiscalYearsData])

  // Read router states (using fiscalYearId instead of selectedYear)
  const selectedFiscalYearId =
    search.fiscalYearId ||
    sortedFiscalYears.find((fy) => fy.status === 'active')?.id ||
    sortedFiscalYears[sortedFiscalYears.length - 1]?.id ||
    ''

  const selectedFyObj = useMemo(() => {
    return sortedFiscalYears.find((fy) => fy.id === selectedFiscalYearId)
  }, [sortedFiscalYears, selectedFiscalYearId])

  const selectedFiscalYear = selectedFyObj ? selectedFyObj.year.toString() : ''

  const selectedSource = (search.source || 'all') as
    | 'all'
    | 'activity'
    | 'opcr'
    | 'project'

  // Accordion active/expanded state controls which budget is currently active in the store
  const [expandedLibId, setExpandedLibId] = useState<string | null>(null)
  const [loadingLibId, setLoadingLibId] = useState<string | null>(null)
  const [errorLibId, setErrorLibId] = useState<string | null>(null)

  const [submissionLib, setSubmissionLib] = useState<LIB | null>(null)

  // Sync route and expanded state values into the Zustand state manager
  const store = useRealignmentStore()

  useEffect(() => {
    store.setSelectedFiscalYear(selectedFiscalYear)
    store.setSelectedSource(selectedSource)
    store.setActiveLibId(expandedLibId)
  }, [selectedFiscalYear, selectedSource, expandedLibId])

  const editMode = store.editMode
  const setEditMode = store.setEditMode
  const showVersionHistory = store.showVersionHistory
  const setShowVersionHistory = store.setShowVersionHistory
  const [selectedLibIdForHistory, setSelectedLibIdForHistory] = useState<string | null>(null)

  // 2. Fetch LIBs list filtered by the selected Fiscal Year GUID and approved status
  const { data: libsData, isLoading: isLibsLoading } = useLIBs({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
      filters: `status==Approved${selectedFiscalYearId ? `,fiscalYearId==${selectedFiscalYearId}` : ''
        }`,
    },
  })

  const { data: amendmentsData, refetch: refetchAmendments } = useLIBAmendments({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
      filters: 'status==Draft|status==Submitted|status==Returned',
    },
  })

  const amendmentsList = amendmentsData?.data || []

  const libsList = (libsData?.data as LIB[] || []).filter(
    (lib) => lib.status === 'Approved',
  )

  // Split and group budget documents by scope and sourceType
  const projectScopedLibs = libsList.filter((lib) => lib.scope === 'Project')
  const opcrActivityScopedLibs = libsList.filter(
    (lib) => lib.scope === 'Activity' && lib.sourceType === 'OPCR',
  )
  const wfpActivityScopedLibs = libsList.filter(
    (lib) => lib.scope === 'Activity' && lib.sourceType === 'WFP',
  )

  const isCurrentYear = selectedFyObj?.status === 'active' || selectedFiscalYear === currentFiscalYear

  // Parameter Navigation Handlers
  const handleSourceChange = (source: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        source: source as 'all' | 'activity' | 'opcr' | 'project',
      }),
    })
    handleAccordionChange(null)
  }

  const handleFiscalYearChange = (fyId: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        fiscalYearId: fyId,
        selectedYear: undefined, // cleanup just in case
      }),
    })
    handleAccordionChange(null)
  }

  // Fetch details handler triggered STRICTLY on expand click
  const handleAccordionChange = async (libId: string | null) => {
    if (!libId) {
      setExpandedLibId(null)
      store.setActiveLibId(null)
      store.setActiveLib(null)
      store.setActiveOpcrData(null)
      store.setActiveWfpData(null)
      store.setEditMode(false)
      store.setViewingVersion(null)
      return
    }

    const libObj = libsList.find((l) => l.id === libId)
    if (!libObj) return

    // Pre-emptively reset states
    store.setActiveLibId(null)
    store.setActiveLib(null)
    store.setActiveOpcrData(null)
    store.setActiveWfpData(null)
    store.setEditMode(false)
    store.setViewingVersion(null)

    setLoadingLibId(libId)
    setErrorLibId(null)

    try {
      const isOpcrActivity =
        libObj.scope === 'Activity' && libObj.sourceType === 'OPCR'
      const isWfpActivity =
        libObj.scope === 'Activity' && libObj.sourceType === 'WFP'
      const isWfpProject =
        libObj.scope === 'Project' && libObj.sourceType === 'WFP'

      // Dynamic HTTP requests
      const libPromise = getLIBRequest.fetcher({
        finalUrl: buildEndpoint(getLIBRequest.endpoint, { id: libObj.id }, {}),
      })

      const activitiesPromise =
        isWfpActivity || isOpcrActivity
          ? getLIBActivitiesRequest.fetcher({
            finalUrl: buildEndpoint(
              getLIBActivitiesRequest.endpoint,
              {},
              { filters: `lineItemBudgetId==${libObj.id}` },
            ),
          })
          : Promise.resolve(null)

      const opcrPromise = isOpcrActivity
        ? getOPCRRequest.fetcher({
          finalUrl: buildEndpoint(getOPCRRequest.endpoint, { id: libObj.sourceId }, {}),
        })
        : Promise.resolve(null)

      const wfpPromise =
        isWfpActivity || isWfpProject
          ? getWFPRequest.fetcher({
            finalUrl: buildEndpoint(getWFPRequest.endpoint, { id: libObj.sourceId }, {}),
          })
          : Promise.resolve(null)

      const [libRes, activitiesRes, opcrRes, wfpRes] = await Promise.all([
        libPromise,
        activitiesPromise,
        opcrPromise,
        wfpPromise,
      ])

      // Populate Zustand state dynamically
      store.setActiveLibId(libObj.id)
      store.setActiveLib(libRes.data)
      store.setActiveOpcrData(opcrRes?.data || null)
      store.setActiveWfpData(wfpRes?.data || null)

      if (libObj.scope === 'Activity') {
        const activitiesData = activitiesRes?.data || []
        await Promise.all(
          activitiesData.map(async (act: LIBActivity) => {
            const detailsRes = await getLineItemBudgetDetailsRequest.fetcher({
              finalUrl: buildEndpoint(
                getLineItemBudgetDetailsRequest.endpoint,
                {},
                {
                  filters: `lineItemBudgetId==${libObj.id},lineItemBudgetActivityId==${act.id}`,
                },
              ),
            })
            act.details = (detailsRes.data) || []
          }),
        )
        const mapped = adaptApiActivitiesToFrontend(activitiesData)
        store.setActivitiesList(mapped)
      } else {
        const orphansData = libRes.data.orphanDetails || []
        const mapped = adaptApiOrphansToProjectGroups(orphansData)
        store.setProjectGroupsList(mapped)
      }

      setExpandedLibId(libId)
    } catch (err) {
      console.error('Failed to load budget details:', err)
      setErrorLibId(libId)
      toast({
        title: 'Error',
        description: 'Failed to load budget details. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoadingLibId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(store.projectGroups, store.activities, selectedFiscalYear)
  }

  const handleExportExcel = async () => {
    const libId = store.activeLibId
    if (!libId) return
    try {
      const genResponse = await generateLIBDocument({
        pathParams: { libId },
        queryParams: { format: 'Excel' },
      })
      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation API')
      }
      const downloadResponse = await downloadLIBDocument({
        pathParams: { documentId },
      })
      const blob = downloadResponse.blob
      const filename = store.activeLib?.libNumber
        ? `${store.activeLib.libNumber}.xlsx`
        : `LIB_${libId}.xlsx`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast({
        title: 'Export Successful',
        description: 'Excel document downloaded successfully.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Export Error',
        description: 'Failed to export Excel document.',
        variant: 'destructive',
      })
    }
  }

  const handleExportPDF = async () => {
    const libId = store.activeLibId
    if (!libId) return
    try {
      const genResponse = await generateLIBDocument({
        pathParams: { libId },
        queryParams: { format: 'Pdf' },
      })
      const documentId = genResponse.data
      if (!documentId) {
        throw new Error('No document ID returned from generation API')
      }
      const downloadResponse = await downloadLIBDocument({
        pathParams: { documentId },
      })
      const blob = downloadResponse.blob
      const filename = store.activeLib?.libNumber
        ? `${store.activeLib.libNumber}.pdf`
        : `LIB_${libId}.pdf`

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      toast({
        title: 'Export Successful',
        description: 'PDF document downloaded successfully.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Export Error',
        description: 'Failed to export PDF document.',
        variant: 'destructive',
      })
    }
  }

  // Render Section Lists
  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    count: number,
  ) => (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
      {icon}
      <h3 className="font-bold text-slate-800 text-sm">
        {title} ({count})
      </h3>
    </div>
  )

  const renderAccordionList = (libs: typeof libsList) => {
    if (libs.length === 0) {
      return (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
          No budget documents registered under this category
        </div>
      )
    }

    return (
      <Accordion
        type="single"
        collapsible
        value={expandedLibId || ''}
        onValueChange={handleAccordionChange}
        className="space-y-3"
      >
        {libs.map((lib) => {
          const projectVersionsList =
            store.projectVersions[selectedFiscalYear]?.[lib.id] || []
          const versions =
            lib.sourceType === 'OPCR'
              ? store.opcrVersions[selectedFiscalYear] || []
              : store.activitiesVersions[selectedFiscalYear]?.[lib.id] || []

          const activeAmendment = amendmentsList.find(
            (am) => am.lineItemBudgetId === lib.id,
          )

          return (
            <RealignmentAccordionItem
              key={lib.id}
              lib={lib}
              activeAmendment={activeAmendment}
              isExpanded={expandedLibId === lib.id}
              isLoading={loadingLibId === lib.id}
              isError={errorLibId === lib.id}
              isCurrentYear={isCurrentYear}
              editMode={editMode}
              onEditClick={() => setEditMode(true)}
              onDoneClick={() => {
                setEditMode(false)
                handleAccordionChange(lib.id)
              }}
              onSubmitClick={() => {
                setSubmissionLib(lib)
              }}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              onExportRealignmentPDF={
                activeAmendment
                  ? () =>
                      downloadRealignmentPdf(
                        activeAmendment.id,
                        lib.libNumber,
                      )
                  : undefined
              }
              onHistoryClick={() => {
                setSelectedLibIdForHistory(lib.id)
                setShowVersionHistory(!showVersionHistory)
              }}
              historyCount={versions.length + projectVersionsList.length}
            />
          )
        })}
      </Accordion>
    )
  }

  return (
    <Tabs defaultValue="workflow" className="w-full space-y-6">
      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
        <TabsTrigger value="workflow">My Realignments</TabsTrigger>
        <TabsTrigger value="management">Requests Management</TabsTrigger>
      </TabsList>

      <TabsContent value="workflow" className="space-y-6 mt-4">
        {/* 1. Configuration Switcher Header */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Selection Configuration
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Configure parameters to load and modify the budgeting
                  realignment model
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Fiscal Year Selector */}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="fiscal-year"
                    className="text-xs font-medium text-slate-700"
                  >
                    Fiscal Year:
                  </Label>
                  <Select
                    value={selectedFiscalYearId}
                    onValueChange={handleFiscalYearChange}
                  >
                    <SelectTrigger
                      id="fiscal-year"
                      className="h-9 w-32 text-xs font-semibold"
                    >
                      <SelectValue placeholder="Select FY" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedFiscalYears.map((fy) => (
                        <SelectItem key={fy.id} value={fy.id}>
                          FY {fy.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source/Level Selector */}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="lib-source"
                    className="text-xs font-medium text-slate-700"
                  >
                    Source Scope:
                  </Label>
                  <Select
                    value={selectedSource}
                    onValueChange={handleSourceChange}
                  >
                    <SelectTrigger
                      id="lib-source"
                      className="h-9 w-44 text-xs font-semibold"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scopes</SelectItem>
                      <SelectItem value="opcr">OPCR Activity-Scoped</SelectItem>
                      <SelectItem value="activity">
                        WFP Activity-Scoped
                      </SelectItem>
                      <SelectItem value="project">WFP Project-Scoped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Readonly/Editable Status Badge indicators */}
                {/* <div className="flex gap-1.5 text-xs">
                {!isCurrentYear && (
                  <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-800 gap-1">
                    <Lock className="w-3 h-3" /> Read-only
                  </Badge>
                )}
                {isCurrentYear && !editMode && !viewingVersion && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-800">
                    Draft
                  </Badge>
                )}
                {isCurrentYear && (editMode || viewingVersion) && (
                  <Badge variant="outline" className="bg-green-50 border-green-300 text-green-800">
                    Editable
                  </Badge>
                )}
              </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Unified Page Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start relative">
          <div className="flex-1 space-y-6 min-w-0 w-full">
            {/* Active Version modification indicator header */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Realignment of Line Item Budgets
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      FY {selectedFiscalYear} — Dynamic Database Realignment
                      Workflow
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Render Accordion Lists grouped by Category */}
            {isLibsLoading ? (
              <div className="space-y-4 py-12 animate-pulse">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Project-Scoped accounts Section */}
                {(selectedSource === 'all' || selectedSource === 'project') && (
                  <div className="space-y-4">
                    {renderSectionHeader(
                      'Project-Scoped',
                      <Layers className="w-4 h-4 text-purple-500" />,
                      projectScopedLibs.length,
                    )}
                    {renderAccordionList(projectScopedLibs)}
                  </div>
                )}

                {/* Activity-Scoped accounts Section */}
                {(selectedSource === 'all' ||
                  selectedSource === 'activity' ||
                  selectedSource === 'opcr') && (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-emerald-500" />
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">
                          Activity-Scoped
                        </h3>
                      </div>

                      {/* OPCR activity subgroup */}
                      {(selectedSource === 'all' || selectedSource === 'opcr') && (
                        <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                          <div className="flex items-center justify-between">
                            {renderSectionHeader(
                              'OPCR Activity-Scoped',
                              <Badge className="bg-blue-600 text-[10px] text-white">
                                OPCR
                              </Badge>,
                              opcrActivityScopedLibs.length,
                            )}
                          </div>
                          {renderAccordionList(opcrActivityScopedLibs)}
                        </div>
                      )}

                      {/* WFP activity subgroup */}
                      {(selectedSource === 'all' ||
                        selectedSource === 'activity') && (
                          <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                            <div className="flex items-center justify-between">
                              {renderSectionHeader(
                                'WFP Activity-Scoped',
                                <Badge className="bg-emerald-600 text-[10px] text-white">
                                  WFP
                                </Badge>,
                                wfpActivityScopedLibs.length,
                              )}
                            </div>
                            {renderAccordionList(wfpActivityScopedLibs)}
                          </div>
                        )}
                    </div>
                  )}
              </div>
            )}
          </div>

        </div>

      </TabsContent>

      {/* 3. History timeline dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent size="xl" className="p-0 overflow-hidden h-[85vh] flex flex-col">
          <VersionHistoryPanel
            libId={selectedLibIdForHistory}
            proposedLibId={
              amendmentsList.find(
                (a) =>
                  a.lineItemBudgetId === selectedLibIdForHistory &&
                  ['Draft', 'Returned', 'Submitted'].includes(a.status)
              )?.proposedLineItemBudgetId || null
            }
            onClose={() => setShowVersionHistory(false)}
          />
        </DialogContent>
      </Dialog>

      <TabsContent value="management" className="space-y-6 mt-4">
        <RealignmentRequestsTab />
      </TabsContent>

      {/* Submission justification dialog */}
      {submissionLib && (
        <CreateLIBAmendmentDialog
          open={!!submissionLib}
          onOpenChange={(open) => {
            if (!open) setSubmissionLib(null)
          }}
          lineItemBudgetId={submissionLib.id}
          onSuccess={async () => {
            const libId = submissionLib.id
            await refetchAmendments()
            setSubmissionLib(null)
            await handleAccordionChange(libId)
          }}
        />
      )}
    </Tabs>
  )
}
