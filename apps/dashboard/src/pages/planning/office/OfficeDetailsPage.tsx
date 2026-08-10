import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  Building,
  Building2Icon,
  HomeIcon,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getOfficeRequest } from '@/components/features/planning/office/office/handlers/getOfficeRequest'
import { getClusterRequest } from '@/components/features/planning/office/office/handlers/getClusterRequest'

const useOffice = createQueryHookFromTemplate(getOfficeRequest)
const useCluster = createQueryHookFromTemplate(getClusterRequest)

function OfficeDetailsPage({ officeId }: { officeId: string }) {
  const { data: office } = useOffice({
    pathParams: { id: officeId },
    queryParams: {},
  })

  const { data: cluster } = useCluster({
    pathParams: { id: office?.data.clusterId || '' },
    queryParams: {},
  })

  return (
    <PageContainer
      title={office?.data.name || 'Office Details'}
      // description={office?.data.description}
      backTo={true}
      backLabel="Back to Offices"
    >
      {/* Basic Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Office Information</CardTitle>
          <CardDescription>Core details about this Office</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Address */}
            <div className="flex items-start gap-3">
              <HomeIcon className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Office Address
                </div>
                <div>{office?.data.address || 'N/A'}</div>
              </div>
            </div>

            {/* Office Head */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Office Head
                </div>
                <div>{office?.data.officeHead || 'N/A'}</div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Email
                </div>
                <div>{office?.data.email || 'N/A'}</div>
              </div>
            </div>

            {/* Contact Number */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Contact Number
                </div>
                <div>{office?.data.contactNumber || 'N/A'}</div>
              </div>
            </div>

            {/* RCC */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Responsibility Center Code
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {office?.data.responsibilityCenterCode || 'N/A'}
                </div>
              </div>
            </div>

            {/* Cluster */}
            <div className="flex items-start gap-3">
              <Building2Icon className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Organizational Cluster
                </div>
                <div>{cluster?.data.name || 'N/A'}</div>
              </div>
            </div>

            {/* Delivery Unit Flag */}
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Delivery Unit
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-center w-fit mx-auto">
                  {office?.data.isDeliveryUnit ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default OfficeDetailsPage
