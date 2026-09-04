import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch, useNavigate } from '@tanstack/react-router'
import api from '@/services/api'
import {
  AlertTriangle,
  Award,
  Calculator,
  FileCheck2,
  FolderOpen,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { AwardRecommendationTab } from '../components/AwardRecommendationTab'
import { BacResolutionModal } from '../components/BacResolutionModal'
import { BidEvaluationTab } from '../components/BidEvaluationTab'
import { BidOpeningTab } from '../components/BidOpeningTab'
import { PostQualificationTab } from '../components/PostQualificationTab'
import {
  BIDDER_SLA_DAYS,
  RA_12009_BAC_DAYS,
  RA_9184_BAC_DAYS,
} from '../data/mockProjects'
import { useBidEvaluationStore } from '../store/bidEvaluationStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BidEvaluationPage() {
  const search = useSearch({ strict: false }) as { projectId?: string }
  const navigate = useNavigate()

  const {
    projects,
    selectedProjectId,
    selectProject,
    resetProject,
  } = useBidEvaluationStore()

  const { data: realProjects = [] } = useQuery({
    queryKey: ['bac-projects-for-evaluation'],
    queryFn: async () => {
      const res = await api.get('/bac/projects?pageSize=50')
      const items = res.data?.data?.items || res.data?.data || []
      return items.map((p: any) => ({
        id: p.id,
        projectName: p.title || 'Untitled Project',
        abc: Number(p.abc || 0),
        resolutionNumber: p.contractNo || (p.id ? p.id.substring(0, 8) : 'BAC-PROJ'),
        governingLaw: 'RA_9184' as const,
        awardCriterion: 'LCRB' as const,
        projectStatus: (p.status === 'Approved' ? 'Approved' : 'Active') as any,
        suppliers: [],
      }))
    },
    staleTime: 60_000,
  })

  // Combine real projects with mock projects (real projects first)
  const combinedProjects = useMemo(() => {
    if (realProjects.length > 0) return realProjects
    return projects
  }, [realProjects, projects])

  const selectedId = useMemo(() => {
    if (search.projectId && combinedProjects.some((p) => p.id === search.projectId)) {
      return search.projectId
    }
    if (selectedProjectId && combinedProjects.some((p) => p.id === selectedProjectId)) {
      return selectedProjectId
    }
    return combinedProjects[0]?.id || ''
  }, [search.projectId, selectedProjectId, combinedProjects])

  const activeProject = combinedProjects.find((p) => p.id === selectedId) ?? combinedProjects[0]

  const handleSelectProject = (newId: string) => {
    selectProject(newId)
    void navigate({
      to: '/v2/bid-evaluation',
      search: { projectId: newId },
    })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('opening')

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val)
  }

  // Check for overdue SLA timers in mock data (retained for backward compatibility during phased migration)
  const checkOverdueTimers = () => {
    if (!activeProject) return []
    const nowMs = Date.now()
    const overdueList: Array<{ supplierName: string; type: 'Bidder' | 'BAC'; days: number }> = []

    ;(activeProject.suppliers || []).forEach((sup: any) => {
      if (sup.status === 'LCB_Notified' && sup.lcbNoticeSentDate) {
        const startMs = new Date(sup.lcbNoticeSentDate).getTime()
        const limitMs = BIDDER_SLA_DAYS * 24 * 60 * 60 * 1000
        if (nowMs > startMs + limitMs) {
          overdueList.push({ supplierName: sup.supplierName, type: 'Bidder', days: BIDDER_SLA_DAYS })
        }
      } else if (sup.status === 'Under_PostQual' && sup.postQualDocsReceivedDate) {
        const limitDays = activeProject.governingLaw === 'RA_9184' ? RA_9184_BAC_DAYS : RA_12009_BAC_DAYS
        const startMs = new Date(sup.postQualDocsReceivedDate).getTime()
        const limitMs = limitDays * 24 * 60 * 60 * 1000
        if (nowMs > startMs + limitMs) {
          overdueList.push({ supplierName: sup.supplierName, type: 'BAC', days: limitDays })
        }
      }
    })

    return overdueList
  }

  const overdueTimers = checkOverdueTimers()

  if (!activeProject) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading public bidding projects...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. HEADER CARD */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
        <CardHeader className="py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-default-900">
                Bid Opening, Evaluation & Post-Qualification
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-3xl">
                Official BAC workspace to verify submitted packages, unseal Envelope 2, mathematically rank bids, and manage post-qualification.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary-700 bg-primary/5 shadow-sm">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> BAC Public Bidding Workspace
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 2. PROJECT SELECTOR CARD */}
      <Card className="border border-default-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-default-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Active Project Selection
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select a public bidding project to record bid opening, execute evaluation, and track post-qualification.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-default-800 whitespace-nowrap">Active Project:</span>
            <Select value={activeProject?.id} onValueChange={handleSelectProject}>
              <SelectTrigger className="w-[380px] bg-white text-default-900 border-default-300 hover:border-default-400 shadow-sm focus:ring-2 focus:ring-primary/20 h-10 transition-colors">
                <SelectValue placeholder="Choose project..." />
              </SelectTrigger>
              <SelectContent className="max-w-[450px]">
                {combinedProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-semibold text-primary">{p.resolutionNumber}</span> - {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => resetProject(activeProject.id)}
              title="Reset Project State"
              className="bg-default-50 hover:bg-default-100 border-default-250 hover:border-default-300 text-default-600 h-10 w-10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 3. NON-DISMISSABLE COMPLIANCE WARNING BANNER */}
      {overdueTimers.length > 0 && (
        <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-5 w-5 text-destructive animate-bounce" />
          <div>
            <AlertTitle className="font-bold text-sm text-destructive-900">🚨 COMPLIANCE ALERT: SLA Timer Overdue</AlertTitle>
            <AlertDescription className="text-xs text-destructive-800 mt-1 space-y-1">
              {overdueTimers.map((t, idx) => (
                <p key={idx}>
                  The <strong>{t.type} SLA</strong> timer for bidder <strong>{t.supplierName}</strong> has exceeded the legal threshold of <strong>{t.days} calendar days</strong>. 
                  This compliance exception has been logged to the audit trail for Commission on Audit (COA) review.
                </p>
              ))}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* 4. PROJECT HEADS & STATE BRIEF */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Governing Law */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-blue-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {activeProject.governingLaw === 'RA_9184' ? 'RA 9184' : 'RA 12009'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              BAC SLA: <span className="font-semibold text-blue-600">{activeProject.governingLaw === 'RA_9184' ? '12 Days' : '10 Days'}</span>
            </p>
          </CardContent>
        </Card>

        {/* Award Criterion */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-purple-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Award Criterion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {activeProject.awardCriterion === 'LCRB' ? 'LCRB (Lowest Price)' : 'MEARB (Weighted Total)'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeProject.awardCriterion === 'MEARB' 
                ? `Split: ${activeProject.technicalWeight}% Tech / ${activeProject.financialWeight}% Fin` 
                : 'Criteria: Lowest Financial Bid'}
            </p>
          </CardContent>
        </Card>

        {/* Approved Budget (ABC) */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-amber-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved Budget (ABC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {formatCurrency(activeProject.abc)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Maximum allowable contract budget
            </p>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className={`border border-default-200 shadow-sm bg-white border-l-4 hover:translate-y-[-2px] transition-all duration-200 ${
          activeProject.projectStatus === 'Active' 
            ? 'border-l-info' 
            : activeProject.projectStatus === 'Pending_HoPE_Approval' 
            ? 'border-l-warning' 
            : 'border-l-success'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge 
                variant="outline" 
                color={
                  activeProject.projectStatus === 'Active' 
                    ? 'info' 
                    : activeProject.projectStatus === 'Pending_HoPE_Approval' 
                    ? 'warning' 
                    : 'success'
                } 
                className="font-bold"
              >
                {activeProject.projectStatus === 'Active' 
                  ? 'Active Evaluation' 
                  : activeProject.projectStatus === 'Pending_HoPE_Approval' 
                  ? 'Pending HoPE Approval' 
                  : 'Approved'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeProject.projectStatus === 'Active' 
                ? 'Evaluation & post-qual phase' 
                : activeProject.projectStatus === 'Pending_HoPE_Approval'
                ? 'Recommended for Award'
                : 'Resolution signed & approved'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. WORKFLOW TABS (Phases 2, 3, 4, 5 Live API Integration) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-default-100 p-1 rounded-lg border border-default-200">
          <TabsTrigger value="opening" className="gap-2 font-bold text-xs">
            <FolderOpen className="h-4 w-4 text-primary" />
            1. Bid Opening (Live API)
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="gap-2 font-bold text-xs">
            <Calculator className="h-4 w-4 text-purple-600" />
            2. Evaluation & Ranking (Live API)
          </TabsTrigger>
          <TabsTrigger value="postqual" className="gap-2 font-bold text-xs">
            <Sparkles className="h-4 w-4 text-amber-600" />
            3. Post-Qualification (Live API)
          </TabsTrigger>
          <TabsTrigger value="award" className="gap-2 font-bold text-xs">
            <Award className="h-4 w-4 text-emerald-600" />
            4. Award Recommendation (Live API)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BID OPENING (LIVE API) */}
        <TabsContent value="opening" className="space-y-4">
          <BidOpeningTab
            projectId={activeProject.id}
            projectName={activeProject.projectName}
            abc={activeProject.abc}
          />
        </TabsContent>

        {/* TAB 2: AUTHORITATIVE BID EVALUATION & RANKING (LIVE API) */}
        <TabsContent value="evaluation" className="space-y-4">
          <BidEvaluationTab
            projectId={activeProject.id}
            projectName={activeProject.projectName}
            abc={activeProject.abc}
            awardCriterion={activeProject.awardCriterion}
            technicalWeight={activeProject.technicalWeight}
            financialWeight={activeProject.financialWeight}
          />
        </TabsContent>

        {/* TAB 3: POST-QUALIFICATION WORKSPACE (LIVE API) */}
        <TabsContent value="postqual" className="space-y-4">
          <PostQualificationTab
            projectId={activeProject.id}
            projectName={activeProject.projectName}
          />
        </TabsContent>

        {/* TAB 4: AWARD RECOMMENDATION (LIVE API) */}
        <TabsContent value="award" className="space-y-4">
          <AwardRecommendationTab
            projectId={activeProject.id}
            projectName={activeProject.projectName}
          />
        </TabsContent>
      </Tabs>

      <BacResolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={activeProject?.bacResolutionDraft}
      />
    </div>
  )
}
