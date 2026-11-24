import React, { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Layers, ShoppingCart, Users, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { TemplateTable } from '@/components/TemplateTable'
import { getManageSupplierPortalTableColumns } from '../tables/ManageSupplierPortalTableColumns'
import { ManageSupplierPortalTableToolbar } from '../tables/ManageSupplierPortalTableToolbar'
import { Project } from '../types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getProjectsRequest } from '../handlers/getProjectsRequest'
import { getRFQsRequest } from '../handlers/getRFQsRequest'

const useProjects = createQueryHookFromTemplate(getProjectsRequest)
const useRFQs = createQueryHookFromTemplate(getRFQsRequest)

export default function ManageSupplierPortalPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const navigate = useNavigate()

  // 1. Fetch BAC Projects (Public Bidding & Posted Projects)
  const { data: projectsResponse, isLoading: isLoadingProjects } = useProjects({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
    enabled: true,
  })

  // 2. Fetch RFQs (Internal / Alternative Methods) - only Approved RFQs for BAC evaluator
  const { data: rfqsResponse, isLoading: isLoadingRFQs } = useRFQs({
    pathParams: {},
    queryParams: {
      pageSize: 100,
      filters: `status=Approved`,
    },
    enabled: true,
  })

  const isLoading = isLoadingProjects || isLoadingRFQs

  const rawProjects = projectsResponse?.data ?? []
  const rawRfqs = rfqsResponse?.data ?? []

  const projects: Project[] = useMemo(() => {
    // 1. Map BAC Projects (Authoritative Opportunities)
    const mappedProjects: Project[] = rawProjects
      .filter((p: any) => {
        const isDraftOrSubmitted =
          p.status &&
          (p.status.toLowerCase() === 'draft' ||
            p.status.toLowerCase() === 'submitted' ||
            p.status.toLowerCase() === 'forapproval')
        if (isDraftOrSubmitted) return false

        const mopName = (
          p.consolidatedPR?.modeOfProcurementName ||
          p.type ||
          ''
        ).toLowerCase()
        const isSvp =
          mopName.includes('svp') ||
          mopName.includes('small value') ||
          mopName.includes('53.9') ||
          (p.consolidatedPR?.cprNumber &&
            p.consolidatedPR.cprNumber.toLowerCase().includes('svp'))

        // Business Rule: hasApprovedRfq is required for Small Value Procurement (SVP) display.
        // Public Bidding projects are governed by PBD / ITB notices and do NOT require an RFQ.
        if (isSvp) {
          const hasApprovedRfq =
            p.hasApprovedRFQ ||
            p.consolidatedPR?.hasApprovedRFQ ||
            (p.consolidatedPR?.rfqs &&
              p.consolidatedPR.rfqs.some(
                (r: any) =>
                  r.status === 'Approved' ||
                  r.status === 3 ||
                  (typeof r.status === 'string' &&
                    r.status.toLowerCase() === 'approved'),
              ))
          return !!hasApprovedRfq
        }

        return true
      })
      .map((p: any) => {
        const mopName =
          p.consolidatedPR?.modeOfProcurementName || 'Public Bidding'
        const schedules = p.biddingActivitySchedules || []
        const latestSchedule =
          schedules.length > 0 ? schedules[schedules.length - 1] : null
        const datePosted = schedules[0]?.startDate || new Date().toISOString()
        const deadline =
          latestSchedule?.endDate || latestSchedule?.startDate || ''

        let status = p.status || 'Active'
        if (
          typeof status === 'string' &&
          status.toLowerCase() === 'submitted'
        ) {
          status = 'ForApproval'
        }

        return {
          id: p.id,
          source: 'bac' as const,
          sourceNumber:
            p.consolidatedPR?.cprNumber || (p.id ? p.id.substring(0, 8) : ''),
          title: p.title || 'Untitled Project',
          status: status as any,
          type: mopName,
          datePosted,
          deadline,
          abc: p.abc || 0,
          applicantCount: p.applicantCount || 0,
        }
      })

    // 2. Identify Standalone RFQs (RFQs not already part of any BAC project)
    const projectCprIds = new Set(
      rawProjects.map((p: any) => p.consolidatedPRId).filter(Boolean),
    )
    const projectIds = new Set(rawProjects.map((p: any) => p.id))

    const standaloneRfqs = rawRfqs.filter((r: any) => {
      const isLinkedToProject =
        (r.consolidatedPRId && projectCprIds.has(r.consolidatedPRId)) ||
        projectIds.has(r.id)
      const isApproved =
        r.status === 'Approved' ||
        r.status === 3 ||
        (typeof r.status === 'string' && r.status.toLowerCase() === 'approved')
      return !isLinkedToProject && isApproved
    })

    const mappedRfqs: Project[] = standaloneRfqs.map((r: any) => {
      const mopName = r.modeOfProcurementName || 'SVP'
      let status = 'Approved'
      if (typeof r.status === 'string' && r.status.trim()) {
        status = r.status
      }

      return {
        id: r.id,
        source: 'rfq' as const,
        sourceNumber: r.rfqNumber,
        title: r.description || r.rfqNumber || 'Untitled RFQ',
        status: status as any,
        type: mopName,
        datePosted: r.deadline || new Date().toISOString(),
        deadline: r.deadline || '',
        abc: r.totalAmount || 0,
        applicantCount: r.applicantCount || 0,
      }
    })

    // Combine and sort by datePosted descending
    return [...mappedProjects, ...mappedRfqs].sort((a, b) => {
      const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0
      const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0
      return dateB - dateA
    })
  }, [rawProjects, rawRfqs])

  const handleViewBids = (projectId: string, source: 'rfq' | 'bac') => {
    navigate({
      to: `/v2/manage-supplier-portal/${projectId}`,
      search: { source } as any,
    })
  }

  const columns = React.useMemo(
    () =>
      getManageSupplierPortalTableColumns({
        onViewBids: handleViewBids,
      }),
    [navigate],
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'rfq' && project.source !== 'rfq') return false
        if (typeFilter === 'bac' && project.source !== 'bac') return false
        if (
          typeFilter === 'SVP' &&
          !project.type.toLowerCase().includes('svp') &&
          !project.type.toLowerCase().includes('small value')
        )
          return false
        if (
          typeFilter === 'Public Bidding' &&
          !project.type.toLowerCase().includes('public')
        )
          return false
      }

      const query = globalFilter.trim().toLowerCase()
      if (!query) return true

      return (
        project.title.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query) ||
        (project.sourceNumber &&
          project.sourceNumber.toLowerCase().includes(query)) ||
        project.type.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
      )
    })
  }, [projects, typeFilter, globalFilter])

  const stats = useMemo(() => {
    const svpList = projects.filter(
      (p) =>
        p.type.toLowerCase().includes('svp') ||
        p.type.toLowerCase().includes('small value') ||
        p.source === 'rfq',
    )
    const publicBiddingList = projects.filter(
      (p) => p.type.toLowerCase().includes('public') || p.source === 'bac',
    )
    const totalApplicants = projects.reduce(
      (count, p) => count + (p.applicantCount ?? 0),
      0,
    )

    return {
      totalProjects: projects.length,
      svpProjects: svpList.length,
      publicBiddingProjects: publicBiddingList.length,
      totalApplicants,
    }
  }, [projects])

  return (
    <div className="w-full space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Manage Supplier Portal</CardTitle>
              <CardDescription className="text-base">
                View active opportunities and manage supplier quotation bids and
                applications across all procurement methods.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <Users className="h-3.5 w-3.5 mr-1.5" /> Supplier Portal
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Total Opportunities
                  </p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {stats.totalProjects}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Internal RFQs / SVP
                  </p>
                  <p className="mt-4 text-3xl font-bold text-violet-900">
                    {stats.svpProjects}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Public Bidding
                  </p>
                  <p className="mt-4 text-3xl font-bold text-sky-900">
                    {stats.publicBiddingProjects}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Total Submissions
                  </p>
                  <p className="mt-4 text-3xl font-bold text-emerald-900">
                    {stats.totalApplicants}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opportunities & Submissions</CardTitle>
          <CardDescription>
            Select an RFQ or BAC project to review supplier bids and
            applications
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading opportunities...</span>
            </div>
          ) : (
            <TemplateTable<Project>
              columns={columns}
              data={filteredProjects}
              actions={['read', 'write']}
              fixedPageSize={10}
              toolbar={() => (
                <ManageSupplierPortalTableToolbar
                  searchTerm={globalFilter}
                  typeFilter={typeFilter}
                  onSearchChange={setGlobalFilter}
                  onTypeFilterChange={setTypeFilter}
                />
              )}
              readonly={false}
              meta={{
                onViewBids: handleViewBids,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
