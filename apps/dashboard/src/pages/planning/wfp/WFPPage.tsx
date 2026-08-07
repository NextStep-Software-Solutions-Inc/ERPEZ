import { useMemo } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { MetaActions } from '@/types/global'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileBarChart2, Layers, Activity, FileText, List } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import { getWFPsRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPsRequest'
import {
  Column,
  Toolbar,
} from '@/components/features/planning/wfp/wfp/table'
import WFPDialogManager from '@/components/features/planning/wfp/wfp/WFPDialogManager'

const useWFPs = createQueryHookFromTemplate(getWFPsRequest)

function WFPPage() {
  // const { deliveryUnitId } = useParams({ from: '/v2/wfp/' })
  const { data: wfpsData } = useWFPs({
    pathParams: {},
    queryParams: { 
      pageNumber: 1, 
      pageSize: 1000,
      // filters: `deliveryUnitId==${deliveryUnitId}`,
    },
  })

  // Use backend data only
  const tableData = wfpsData?.data || []

  // Calculate metrics for status cards
  const metrics = useMemo(() => {
    const totalProjects = tableData.length
    const opcrCount = tableData.filter((w) => w.mode === 'OPCR').length
    const externalCount = tableData.filter((w) => w.mode === 'External').length

    const counts = {
      draft: tableData.filter((w) => w.status === 'Draft').length,
      submitted: tableData.filter((w) => w.status === 'Submitted').length,
      approved: tableData.filter((w) => w.status === 'Approved').length,
      pendingReturned: tableData.filter((w) => w.status === 'Pending' || w.status === 'Returned').length,
    }

    return {
      totalProjects,
      opcrCount,
      externalCount,
      counts,
    }
  }, [tableData])

  // 2. Define specific actions for WFP (Write, Approve, Delete)
  const actions: MetaActions = ['write', 'approve', 'delete','read','submit']

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match KPI Library styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Work and Financial Plan</CardTitle>
              <CardDescription className="text-base">
                Manage work and financial plans, activities, and budgets — create, edit, submit, and track WFPs and approvals.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <FileBarChart2 className="h-3.5 w-3.5 mr-1.5" /> Financial Plan
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total WFP Projects */}
        <Card className="bg-indigo-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Total WFP Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-indigo-600 shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700">
                  {metrics.totalProjects}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Active planning forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OPCR Source Plans */}
        <Card className="bg-emerald-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              OPCR Source Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-emerald-600 shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {metrics.opcrCount}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Driven by OPCR targets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Source Plans */}
        <Card className="bg-sky-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              External Source Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-md bg-white text-sky-600 shadow-sm">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-sky-700">
                  {metrics.externalCount}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Standalone planning forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WFP Status Summary */}
        <Card className="bg-gray-50 hover:shadow-md transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              WFP Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400 inline-block"></span>
                <span className="text-muted-foreground">Drafts:</span>
              </div>
              <span className="font-medium">{metrics.counts.draft}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 inline-block"></span>
                <span className="text-muted-foreground">Submitted:</span>
              </div>
              <span className="font-medium">{metrics.counts.submitted}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-muted-foreground">Approved:</span>
              </div>
              <span className="font-medium">{metrics.counts.approved}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-muted-foreground">Pending/Returned:</span>
              </div>
              <span className="font-medium">{metrics.counts.pendingReturned}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <TemplateTable
          columns={Column}
          data={tableData}
          actions={actions}
          readonly={false}
          toolbar={(table) => (
            <Toolbar 
              table={table} 
              showColumnVisibility={true}
            />
          )}
          meta={{ wfps: tableData }}
          fixedPageSize={10}
        />
      </div>
      <WFPDialogManager />
    </div>
  )
}

export default WFPPage