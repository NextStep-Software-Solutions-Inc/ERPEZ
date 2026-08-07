import { createFileRoute } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  XCircle,
} from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFundSourceRequest } from '@/components/features/planning/fund-source/handlers/getFundSourceRequest'

export const Route = createFileRoute('/v1/planning/fund/$fundId')({
  component: FundDetailPage,
})

const useFundSource = createQueryHookFromTemplate(getFundSourceRequest)

function FundDetailPage() {
  const { fundId } = Route.useParams()
  const { data: fundSourceData, isLoading } = useFundSource({
    pathParams: { id: fundId },
    queryParams: {},
  })

  const fundSource = fundSourceData?.data

  if (isLoading) {
    return (
      <PageContainer
        title="Fund Source Details"
        backTo="/planning/fund"
        backLabel="Back to Fund Sources"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    )
  }

  if (!fundSource) {
    return (
      <PageContainer
        title="Fund Source Details"
        backTo="/planning/fund"
        backLabel="Back to Fund Sources"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Fund source not found</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Fund Source Details"
      description="View detailed information about the fund source"
      backTo="/planning/fund"
      backLabel="Back to Fund Sources"
    >
      <div className="space-y-6">
        {/* General Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Row: 3 columns */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Fund Source */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <label className="text-xs font-medium text-muted-foreground">
                      Fund Source
                    </label>
                  </div>
                  <p className="text-sm font-semibold">{fundSource.name}</p>
                </div>

                {/* Fund Source Code */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <label className="text-xs font-medium text-muted-foreground">
                      Fund Source Code
                    </label>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200 bg-blue-50"
                  >
                    {fundSource.code}
                  </Badge>
                </div>

                {/* Date Created */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <label className="text-xs font-medium text-muted-foreground">
                      Date Created
                    </label>
                  </div>
                  <p className="text-sm font-semibold">
                    {fundSource.createdAt
                      ? new Date(fundSource.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Bottom Row: 2 columns */}
              <div className="grid gap-6 md:grid-cols-2 border-t pt-6">
                {/* Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Type
                  </label>
                  <p className="text-sm font-semibold">{fundSource.type}</p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  {fundSource.isActive ? (
                    <Badge className="flex w-fit items-center gap-1 bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="flex w-fit items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fund Source Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fund Source Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fund Cluster */}
            <div className="border-b pb-6 last:border-b-0">
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Fund Cluster
              </label>
              <p className="text-sm text-foreground">
                {fundSource.fundCluster || 'N/A'}
              </p>
            </div>

            {/* Financing Source / Category */}
            <div className="border-b pb-6 last:border-b-0">
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Fund Category
              </label>
              <p className="text-sm text-foreground">
                {fundSource.category || 'N/A'}
              </p>
            </div>

            {/* Authorization */}
            <div className="border-b pb-6 last:border-b-0">
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Authorization
              </label>
              <p className="text-sm text-foreground">
                {fundSource.authorization || 'N/A'}
              </p>
            </div>

            {/* Fund Source ID */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Fund Source ID
              </label>
              <p className="text-xs font-mono text-muted-foreground">
                {fundSource.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
