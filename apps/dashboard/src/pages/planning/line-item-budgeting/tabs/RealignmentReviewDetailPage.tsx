import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Info, ArrowRight, Activity as ActivityIcon, Layers, FileText, Download, Eye } from 'lucide-react'
import type { LIBAmendment } from '@/features/planning/line-item-budgeting/line-item-budget/types/type'
import { useRealignmentPdf, formatModificationReason } from '@/features/planning/line-item-budgeting/realignment'
import { DraftAmendmentActivityView } from '@/features/planning/line-item-budgeting/realignment/components/DraftAmendmentActivityView'
import { DraftAmendmentProjectView } from '@/features/planning/line-item-budgeting/realignment/components/DraftAmendmentProjectView'
import {
  adaptApiActivitiesToFrontend,
  adaptApiOrphansToProjectGroups,
} from '@/features/planning/line-item-budgeting/realignment/utils/realignmentMapper'
import {
  diffActivities,
  diffProjectGroups,
  type ActivityDiff,
  type ObjectGroupDiff,
  type BudgetItemDiff,
  type ProjectItemDiff,
} from '@/features/planning/line-item-budgeting/realignment/utils/diffEngine'
import { useRealignmentStore } from '@/features/planning/line-item-budgeting/realignment/store/realignmentStore'
import api from '@/services/api'
import type { LIBActivity, LIBDetails, OrphanLineItemDetail } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { useToast } from '@/components/ui/use-toast'

interface RealignmentReviewDetailPageProps {
  amendment: LIBAmendment
  onBack: () => void
  onApprove: (id: string) => Promise<void>
  onReturn: (id: string) => Promise<void>
  isApproving: boolean
  isReturning: boolean
}

export function RealignmentReviewDetailPage({
  amendment,
  onBack,
  onApprove,
  onReturn,
  isApproving,
  isReturning,
}: RealignmentReviewDetailPageProps) {
  const { toast } = useToast()
  const { downloadPdf, previewPdf, isGenerating } = useRealignmentPdf()
  const [draftLib, setDraftLib] = useState<LIBDetails | null>(null)
  const [originalLib, setOriginalLib] = useState<LIBDetails | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(true)

  const activeOpcrData = useRealignmentStore((state) => state.activeOpcrData)
  const activeWfpData = useRealignmentStore((state) => state.activeWfpData)

  // Fetch proposed draft clone AND original baseline approved details completely
  useEffect(() => {
    let active = true
    const fetchAllDetails = async () => {
      setIsLoadingDraft(true)
      try {
        // 1. Fetch proposed draft clone budget details
        const proposedRes = await api.get<{ data: LIBDetails }>(`/libs/${amendment.proposedLineItemBudgetId}`)
        const proposedData = proposedRes.data?.data

        if (proposedData && amendment.lineItemBudget?.scope === 'Activity') {
          const detailsRes = await api.get<{ data: LIBActivity[] }>(`/lib-activities`, {
            params: { filters: `lineItemBudgetId==${amendment.proposedLineItemBudgetId}` },
          })
          const activitiesData = detailsRes.data?.data || []

          await Promise.all(
            activitiesData.map(async (act: LIBActivity) => {
              const actDetailsRes = await api.get<{ data: any[] }>(`/line-item-budget-details`, {
                params: {
                  filters: `lineItemBudgetId==${amendment.proposedLineItemBudgetId},lineItemBudgetActivityId==${act.id}`,
                },
              })
              act.details = actDetailsRes.data?.data || []
            }),
          )
          proposedData.activities = activitiesData
        }

        // 2. Fetch original baseline approved budget details
        const originalRes = await api.get<{ data: LIBDetails }>(`/libs/${amendment.lineItemBudgetId}`)
        const originalData = originalRes.data?.data

        if (originalData && amendment.lineItemBudget?.scope === 'Activity') {
          const originalDetailsRes = await api.get<{ data: LIBActivity[] }>(`/lib-activities`, {
            params: { filters: `lineItemBudgetId==${amendment.lineItemBudgetId}` },
          })
          const originalActivitiesData = originalDetailsRes.data?.data || []

          await Promise.all(
            originalActivitiesData.map(async (act: LIBActivity) => {
              const actDetailsRes = await api.get<{ data: any[] }>(`/line-item-budget-details`, {
                params: {
                  filters: `lineItemBudgetId==${amendment.lineItemBudgetId},lineItemBudgetActivityId==${act.id}`,
                },
              })
              act.details = actDetailsRes.data?.data || []
            }),
          )
          originalData.activities = originalActivitiesData
        }

        if (active) {
          setDraftLib(proposedData)
          setOriginalLib(originalData)
        }
      } catch (err) {
        console.error('Failed to load budget comparison details:', err)
        toast({
          title: 'Error',
          description: 'Failed to fetch the budget details for comparison.',
          variant: 'destructive',
        })
      } finally {
        if (active) {
          setIsLoadingDraft(false)
        }
      }
    }

    fetchAllDetails()
    return () => {
      active = false
    }
  }, [amendment.proposedLineItemBudgetId, amendment.lineItemBudgetId, amendment.lineItemBudget?.scope, toast])

  // Format baseline approved references
  const originalActivities = useMemo(() => {
    return originalLib?.activities
      ? adaptApiActivitiesToFrontend(originalLib.activities)
      : []
  }, [originalLib])

  const originalProjectGroups = useMemo(() => {
    return originalLib?.orphanDetails
      ? adaptApiOrphansToProjectGroups(originalLib.orphanDetails as OrphanLineItemDetail[])
      : []
  }, [originalLib])

  // Format proposed draft references
  const proposedActivities = useMemo(() => {
    if (!draftLib?.activities) return []
    return adaptApiActivitiesToFrontend(draftLib.activities)
  }, [draftLib])

  const proposedProjectGroups = useMemo(() => {
    if (!draftLib?.orphanDetails) return []
    return adaptApiOrphansToProjectGroups(draftLib.orphanDetails)
  }, [draftLib])

  // Compute visual differences using diffEngine
  const budgetScope = originalLib?.scope || draftLib?.scope || amendment.lineItemBudget?.scope
  const isActivityScoped = budgetScope === 'Activity'

  const activityDiffList = useMemo<ActivityDiff[]>(() => {
    if (budgetScope !== 'Activity') return []
    return diffActivities(originalActivities, proposedActivities)
  }, [originalActivities, proposedActivities, budgetScope])

  const projectDiffList = useMemo<ObjectGroupDiff[]>(() => {
    if (budgetScope !== 'Project') return []
    return diffProjectGroups(originalProjectGroups, proposedProjectGroups)
  }, [originalProjectGroups, proposedProjectGroups, budgetScope])

  // Render Diff Log Cards
  const renderActivityDiffs = () => {
    const changedActivities = activityDiffList.filter(act => act.status !== 'unchanged')

    if (changedActivities.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50">
          No differences found between the original and proposed budgets.
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {changedActivities.map((act) => {
          const actColor = act.status === 'added' ? 'border-emerald-300 bg-emerald-50/[0.02]' : act.status === 'deleted' ? 'border-rose-300 bg-rose-50/[0.01]' : 'border-amber-300 bg-amber-50/[0.01]'
          const actBadge = act.status === 'added' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : act.status === 'deleted' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'

          return (
            <Card key={act.id} className={`border ${actColor} shadow-xs rounded-xl overflow-hidden`}>
              <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4 text-indigo-500" />
                  <span className={`text-xs font-bold text-slate-800 ${act.status === 'deleted' ? 'line-through text-slate-400' : ''}`}>
                    {act.name}
                  </span>
                </div>
                <Badge variant="outline" className={`${actBadge} text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5`}>
                  {act.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {act.expenditureTypes.map((type) => {
                  const changedItems = type.itemsOfExpenditure.flatMap(ioe => ioe.items).filter(item => item.status !== 'unchanged')
                  if (changedItems.length === 0) return null

                  return (
                    <div key={type.id} className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-slate-200 hover:bg-slate-200 text-slate-700 text-[9px] font-bold">
                          {type.type}
                        </Badge>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {type.name}
                        </span>
                      </div>
                      <div className="space-y-2 pl-4 border-l border-slate-100">
                        {changedItems.map((item: BudgetItemDiff) => {
                          const itemColor = item.status === 'added' ? 'border-emerald-200 bg-emerald-50/20 text-emerald-950' : item.status === 'deleted' ? 'border-rose-200 bg-rose-50/10 text-slate-400 line-through' : 'border-amber-200 bg-amber-50/20 text-amber-950'
                          const itemBadge = item.status === 'added' ? 'bg-emerald-100 text-emerald-800' : item.status === 'deleted' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'

                          return (
                            <div key={item.id} className={`p-3 border rounded-lg ${itemColor} text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${itemBadge} text-[8px] uppercase tracking-wider font-extrabold px-1.5`}>
                                    {item.status}
                                  </Badge>
                                  <span className="font-bold">{item.description}</span>
                                </div>
                                {item.status === 'modified' && item.originalValues && (
                                  <div className="text-[10px] text-slate-500 font-medium grid grid-cols-2 sm:grid-cols-4 gap-x-3 mt-1">
                                    <span>Q1: ₱{item.originalValues.q1.toLocaleString()} → ₱{item.q1.toLocaleString()}</span>
                                    <span>Q2: ₱{item.originalValues.q2.toLocaleString()} → ₱{item.q2.toLocaleString()}</span>
                                    <span>Q3: ₱{item.originalValues.q3.toLocaleString()} → ₱{item.q3.toLocaleString()}</span>
                                    <span>Q4: ₱{item.originalValues.q4.toLocaleString()} → ₱{item.q4.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Total Budget</p>
                                {item.status === 'modified' && item.originalValues ? (
                                  <span className="font-extrabold flex items-center gap-1.5">
                                    <span className="text-slate-400 line-through">₱{item.originalValues.total.toLocaleString()}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-amber-700">₱{item.total.toLocaleString()}</span>
                                  </span>
                                ) : (
                                  <span className="font-extrabold">₱{item.total.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderProjectDiffs = () => {
    const changedGroups = projectDiffList.filter(g => g.status !== 'unchanged')

    if (changedGroups.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400 text-xs border border-dashed rounded-xl bg-slate-50">
          No differences found between the original and proposed budgets.
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {changedGroups.map((g) => {
          const gColor = g.status === 'added' ? 'border-emerald-300 bg-emerald-50/[0.02]' : g.status === 'deleted' ? 'border-rose-300 bg-rose-50/[0.01]' : 'border-amber-300 bg-amber-50/[0.01]'
          const gBadge = g.status === 'added' ? 'bg-emerald-100 text-emerald-800' : g.status === 'deleted' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'

          return (
            <Card key={g.id} className={`border ${gColor} shadow-xs rounded-xl overflow-hidden`}>
              <CardHeader className="py-3 px-4 bg-slate-50/50 border-b flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs font-bold text-slate-800 ${g.status === 'deleted' ? 'line-through text-slate-400' : ''}`}>
                    [{g.code}] {g.name}
                  </span>
                </div>
                <Badge variant="outline" className={`${gBadge} text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5`}>
                  {g.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {g.descriptionGroups.map((dg) => {
                  const changedItems = dg.items.filter(item => item.status !== 'unchanged')
                  if (changedItems.length === 0) return null

                  return (
                    <div key={dg.id} className="space-y-2">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        {dg.description}
                      </p>
                      <div className="space-y-2 pl-4 border-l border-slate-100">
                        {changedItems.map((item: ProjectItemDiff) => {
                          const itemColor = item.status === 'added' ? 'border-emerald-200 bg-emerald-50/20 text-emerald-950' : item.status === 'deleted' ? 'border-rose-200 bg-rose-50/10 text-slate-400 line-through' : 'border-amber-200 bg-amber-50/20 text-amber-950'
                          const itemBadge = item.status === 'added' ? 'bg-emerald-100 text-emerald-800' : item.status === 'deleted' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'

                          return (
                            <div key={item.id} className={`p-3 border rounded-lg ${itemColor} text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${itemBadge} text-[8px] uppercase tracking-wider font-extrabold px-1.5`}>
                                    {item.status}
                                  </Badge>
                                  <span className="font-bold">{item.description}</span>
                                </div>
                                {item.status === 'modified' && item.originalValues && (
                                  <div className="text-[10px] text-slate-500 font-medium grid grid-cols-2 gap-x-3 mt-1">
                                    <span>Qty: {item.originalValues.qty} → {item.qty}</span>
                                    <span>Cost: ₱{item.originalValues.unitCost.toLocaleString()} → ₱{item.unitCost.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Total Budget</p>
                                {item.status === 'modified' && item.originalValues ? (
                                  <span className="font-extrabold flex items-center gap-1.5">
                                    <span className="text-slate-400 line-through">₱{item.originalValues.budget.toLocaleString()}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-amber-700">₱{item.budget.toLocaleString()}</span>
                                  </span>
                                ) : (
                                  <span className="font-extrabold">₱{item.budget.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Navigation Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-600 rounded-lg shrink-0" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Review Realignment Request
              </h3>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 shadow-none">
                {amendment.status}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              LIB Ref: {amendment.lineItemBudget?.libNumber} • Proposal Draft ID: {amendment.proposedLineItemBudgetId.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Realignment Document Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => previewPdf(amendment.id)}
            disabled={isGenerating}
            className="h-8 text-xs font-semibold gap-1.5 shadow-2xs border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            Preview PDF
          </Button>
          <Button
            size="sm"
            onClick={() => downloadPdf(amendment.id, amendment.lineItemBudget?.libNumber)}
            disabled={isGenerating}
            className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs font-semibold gap-1.5 shadow-sm shadow-red-500/10"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            Download ISO Document
          </Button>
        </div>
      </div>

      {/* 2. Justification Summary Box */}
      <Card className="shadow-xs border border-slate-200 bg-white">
        <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Realignment Justification Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-xs text-slate-700 space-y-3">
          <div>
            <span className="font-extrabold text-slate-500 uppercase tracking-wide block mb-1">Reason Category</span>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-semibold px-2.5 py-0.5">
              {formatModificationReason(amendment.reason)}
            </Badge>
          </div>
          <div>
            <span className="font-extrabold text-slate-500 uppercase tracking-wide block mb-1">Detailed Explanation</span>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-slate-800 leading-relaxed font-medium italic">
              &ldquo;{amendment.justification || 'No justification details provided.'}&rdquo;
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Review Workspace Tabs */}
      <Tabs defaultValue="diff" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="diff" className="text-xs font-bold rounded-lg px-4">
            Visual Diff Changelog
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-xs font-bold rounded-lg px-4">
            Side-by-Side Comparison
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visual Diff View */}
        <TabsContent value="diff" className="space-y-4">
          <Card className="shadow-sm bg-white">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Proposed Line Item Changes
              </CardTitle>
              <CardDescription className="text-xs">
                A structured breakdown of modified, added, and deleted allocations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {isLoadingDraft ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">Generating visual comparison...</span>
                </div>
              ) : isActivityScoped ? (
                renderActivityDiffs()
              ) : (
                renderProjectDiffs()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Side-by-Side Comparison */}
        <TabsContent value="comparison" className="space-y-4">
          {isLoadingDraft ? (
            <div className="bg-white rounded-xl shadow-xs border p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-655" />
              <span className="text-xs font-semibold">Loading side-by-side comparison...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Original Reference */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline Approved Reference</span>
                </div>
                <Card className="bg-slate-50/50 border border-slate-200 shadow-xs rounded-xl overflow-hidden p-5">
                  {originalLib && (
                    isActivityScoped ? (
                      <DraftAmendmentActivityView
                        draftLibId={originalLib.id}
                        draftLib={originalLib}
                        approvedActivities={originalActivities}
                        opcrData={activeOpcrData || null}
                        wfpData={activeWfpData || null}
                        readOnly={true}
                      />
                    ) : (
                      <DraftAmendmentProjectView
                        draftLibId={originalLib.id}
                        draftLib={originalLib}
                        approvedProjectGroups={originalProjectGroups}
                        readOnly={true}
                      />
                    )
                  )}
                </Card>
              </div>

              {/* Right Column: Realigned Sandbox Proposal */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Proposed Realignment Sandbox</span>
                  <Badge className="bg-indigo-600 text-white font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.2">
                    Clone Draft
                  </Badge>
                </div>
                <Card className="bg-indigo-500/[0.01] border-2 border-indigo-200 border-dashed shadow-sm rounded-xl overflow-hidden p-5">
                  {draftLib && (
                    isActivityScoped ? (
                      <DraftAmendmentActivityView
                        draftLibId={draftLib.id}
                        draftLib={draftLib}
                        approvedActivities={originalActivities}
                        opcrData={activeOpcrData || null}
                        wfpData={activeWfpData || null}
                        readOnly={true}
                      />
                    ) : (
                      <DraftAmendmentProjectView
                        draftLibId={draftLib.id}
                        draftLib={draftLib}
                        approvedProjectGroups={originalProjectGroups}
                        readOnly={true}
                      />
                    )
                  )}
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reviewer Action Controls - Moved to the bottom of the page (below diffs and comparison view) */}
      {amendment.status === 'Submitted' && (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 h-9 font-semibold text-xs shadow-2xs"
            onClick={() => onReturn(amendment.id)}
            disabled={isReturning || isApproving || isLoadingDraft}
          >
            {isReturning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
            Return to Draft
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-9 font-semibold text-xs shadow-sm shadow-green-500/10"
            onClick={() => onApprove(amendment.id)}
            disabled={isReturning || isApproving || isLoadingDraft}
          >
            {isApproving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
            Approve & Merge
          </Button>
        </div>
      )}
    </div>
  )
}
