import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Building, Building2Icon } from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getOrganizationalClusterRequest } from '@/components/features/planning/organizationalCluster/handlers/getOrganizationalClusterRequest'

const useCluster = createQueryHookFromTemplate(getOrganizationalClusterRequest)

function OrganizationalClusterDetailsPage({
  clusterId,
}: {
  clusterId: string
}) {
  const { data: cluster } = useCluster({
    pathParams: { id: clusterId },
    queryParams: {},
  })

  return (
    <PageContainer
      title={cluster?.data.name || 'Organizational Cluster Details'}
      backTo={true}
      backLabel="Back to Organizational Clusters"
    >
      {/* Basic Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Organizational Cluster Information</CardTitle>
          <CardDescription>Core details about this Cluster</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Cluster Name */}
            <div className="flex items-start gap-3">
              <Building2Icon className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Cluster Name
                </div>
                <div>{cluster?.data.name || 'N/A'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Description
                </div>
                <div>{cluster?.data.description || 'N/A'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default OrganizationalClusterDetailsPage
