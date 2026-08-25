import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Layers, ShoppingCart, Users, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { TemplateTable } from '@/components/TemplateTable'
import { getManageSupplierPortalTableColumns } from '../tables/ManageSupplierPortalTableColumns'
import { ManageSupplierPortalTableToolbar } from '../tables/ManageSupplierPortalTableToolbar'
import { Project } from '../types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getProjectsRequest } from '../handlers/getProjectsRequest'

const useProjects = createQueryHookFromTemplate(getProjectsRequest)

export default function ManageSupplierPortalPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'SVP' | 'Public Bidding'>('all')
  const navigate = useNavigate()

  const { data: projectsResponse, isLoading } = useProjects({
    pathParams: {},
    queryParams: {
      pageSize: 100,
    },
  })

  const rawProjects = projectsResponse?.data ?? []

  const projects: Project[] = useMemo(() => {
    return rawProjects.map((p: any) => {
      const mopName = p.consolidatedPR?.modeOfProcurementName || ''
      const isSvp =
        mopName.toLowerCase().includes('svp') ||
        mopName.toLowerCase().includes('small value')
      const projectType: 'SVP' | 'Public Bidding' = isSvp ? 'SVP' : 'Public Bidding'

      const schedules = p.biddingActivitySchedules || []
      const latestSchedule = schedules.length > 0 ? schedules[schedules.length - 1] : null
      const datePosted = schedules[0]?.startDate || new Date().toISOString()
      const deadline = latestSchedule?.endDate || latestSchedule?.startDate || ''

      return {
        id: p.id,
        title: p.title || 'Untitled Project',
        status: (p.status || 'Active') as any,
        type: projectType,
        datePosted,
        deadline,
        abc: p.abc || 0,
        applicantCount: p.applicantCount,
      }
    })
  }, [rawProjects])

  const handleViewBids = (projectId: string) => {
    navigate({ to: `/v2/manage-supplier-portal/${projectId}` })
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
      if (typeFilter !== 'all' && project.type !== typeFilter) {
        return false
      }

      const query = globalFilter.trim().toLowerCase()
      if (!query) return true

      return (
        project.title.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query)
      )
    })
  }, [projects, typeFilter, globalFilter])

  const stats = useMemo(() => {
    return {
      totalProjects: projects.length,
      svpProjects: projects.filter((p) => p.type === 'SVP').length,
      publicBiddingProjects: projects.filter((p) => p.type === 'Public Bidding').length,
      totalApplicants: projects.reduce((count, p) => count + (p.applicantCount ?? 0), 0),
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
                View active and closed projects and manage supplier bids.
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
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Projects</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">{stats.totalProjects}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">SVP Projects</p>
                  <p className="mt-4 text-3xl font-bold text-violet-900">{stats.svpProjects}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Public Bidding</p>
                  <p className="mt-4 text-3xl font-bold text-sky-900">{stats.publicBiddingProjects}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Applicants</p>
                  <p className="mt-4 text-3xl font-bold text-emerald-900">{stats.totalApplicants}</p>
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
          <CardTitle>Projects</CardTitle>
          <CardDescription>Select a project to review applicant bids</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading projects...</span>
            </div>
          ) : (
            <TemplateTable<Project>
              columns={columns}
              data={filteredProjects}
              actions={['read', 'write']}
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
