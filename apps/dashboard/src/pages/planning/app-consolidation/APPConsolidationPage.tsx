import type { MetaActions } from '@/types/global'
import { TemplateTable } from '@/components/TemplateTable'
import { AppListColumns, AppListToolbar } from '@/features/planning/app-consolidation/tables'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAPPListRequest } from '@/features/planning/app-consolidation/handlers'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageSearch, FileText, Layers, CheckCircle, Clock, List } from 'lucide-react'
import { useMemo } from 'react'
import { useAtom } from 'jotai'
import { appListFilterAtom } from '@/features/planning/app-consolidation/atoms'

const useAPPList = createQueryHookFromTemplate(getAPPListRequest)

export function APPConsolidationPage() {
  const [filter] = useAtom(appListFilterAtom)

  // Fetch APP list from API with default pagination
  const { data: apiResponse, isLoading, error } = useAPPList({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 50,
    },
  })

  // Transform API response to component data
  const rawAppList = apiResponse?.data || []
  const actions: MetaActions = ['write', 'delete']

  // Apply filters (search, fiscal year, status, type)
  const filteredAppList = useMemo(() => {
    return rawAppList.filter((app) => {
      // 1. Search filter
      if (filter.searchTerm?.trim()) {
        const term = filter.searchTerm.trim().toLowerCase()
        const matchesNumber = app.appNumber?.toLowerCase().includes(term)
        const matchesName = app.name?.toLowerCase().includes(term)
        const matchesDesc = app.description?.toLowerCase().includes(term)
        if (!matchesNumber && !matchesName && !matchesDesc) return false
      }

      // 2. Fiscal Year filter
      if (filter.fiscalYear && filter.fiscalYear !== 'all') {
        const fyStr = filter.fiscalYear.toString()
        const matchesFy = app.fiscalYearName?.includes(fyStr) || app.FiscalYear?.year === filter.fiscalYear
        if (!matchesFy) return false
      }

      // 3. Status filter
      if (filter.status && filter.status !== 'all') {
        if (app.status?.toLowerCase() !== filter.status.toLowerCase()) return false
      }

      // 4. Type filter (Indicative, Final, Updated)
      if (filter.appType && filter.appType !== 'all') {
        const itemType = app.appType || 'Indicative'
        if (itemType.toLowerCase() !== filter.appType.toLowerCase()) return false
      }

      return true
    })
  }, [rawAppList, filter])

  // Calculate APP metrics for dashboard consistency
  const totalPlans = rawAppList.length
  const draftPlans = rawAppList.filter(
    (app) => app.status?.toLowerCase() === 'draft'
  ).length
  const pendingPlans = rawAppList.filter(
    (app) =>
      app.status?.toLowerCase() === 'for review' ||
      app.status?.toLowerCase() === 'pending-review' ||
      app.status?.toLowerCase() === 'submitted'
  ).length
  const approvedPlans = rawAppList.filter(
    (app) => app.status?.toLowerCase() === 'approved'
  ).length
  const publishedPlans = rawAppList.filter(
    (app) => app.status?.toLowerCase() === 'published' || app.status?.toLowerCase() === 'locked'
  ).length

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading Annual Procurement Plans...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">Failed to load Annual Procurement Plans. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match KPI Library styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Annual Procurement Plans</CardTitle>
              <CardDescription className="text-base">
                View and manage all procurement plans across your organization
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <PackageSearch className="h-3.5 w-3.5 mr-1.5" /> APP Consolidation
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Consolidated Plans */}
        <Card className="bg-indigo-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Total Consolidated Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-indigo-600 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700">
                  {totalPlans}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Total plans in system</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved APPs */}
        <Card className="bg-emerald-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              Approved APPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {approvedPlans}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Plans ready for execution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="bg-sky-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-sky-700">
                  {pendingPlans}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Plans awaiting sign-off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* APP Status Summary */}
        <Card className="bg-gray-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              APP Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
                <span className="text-muted-foreground">Drafts:</span>
              </div>
              <span className="font-medium">{draftPlans}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 inline-block"></span>
                <span className="text-muted-foreground">Pending / Submitted:</span>
              </div>
              <span className="font-medium">{pendingPlans}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-muted-foreground">Approved:</span>
              </div>
              <span className="font-medium">{approvedPlans}</span>
            </div>
            {publishedPlans > 0 && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 inline-block"></span>
                  <span className="text-muted-foreground">Published / Locked:</span>
                </div>
                <span className="font-medium">{publishedPlans}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Procurement Plans</CardTitle>
          <CardDescription>
            View and manage consolidated annual procurement plans across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateTable
            columns={AppListColumns}
            data={filteredAppList}
            actions={actions}
            readonly={false}
            toolbar={(table) => <AppListToolbar table={table} />}
          />
        </CardContent>
      </Card>
    </div>
  )
}
