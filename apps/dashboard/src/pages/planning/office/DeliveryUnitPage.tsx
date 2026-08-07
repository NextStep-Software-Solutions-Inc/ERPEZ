import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Building2, Mail, MapPin, MapPinHouse, Phone } from 'lucide-react'
import type { MetaActions } from '@/types/global'
import { PageContainer } from '@/components/PageContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { TemplateTable } from '@/components/TemplateTable'
import { Toolbar } from '@/components/features/planning/delivery-unit/table'
import { SubDUColumn } from '@/components/features/planning/delivery-unit/table/SubDUColumn'

const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)
function DeliveryUnitPage({
  deliveryUnitId,
  deliveryUnitSearch,
}: {
  deliveryUnitId: string
  deliveryUnitSearch?: string
}) {
  const { data: deliveryUnit } = useDeliveryUnit({
    pathParams: { id: deliveryUnitId },
    queryParams: {},
  })

  const actions: MetaActions = ['write', 'delete']

  return (
    <PageContainer
      title={deliveryUnit?.data.office?.name || 'Delivery Unit Details'}
      backTo={true}
      backLabel="Back to Delivery Units"
    >
      {/* Basic Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Delivery Unit Information</CardTitle>
          <CardDescription>
            Core details about this Delivery Unit
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPinHouse className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Address
                </div>
                <div>{deliveryUnit?.data?.office?.address || 'N/A'}</div>
              </div>
            </div>
            {/* Contact Number */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Contact Number
                </div>
                <div>{deliveryUnit?.data?.office?.contactNumber || 'N/A'}</div>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Email
                </div>
                <div>{deliveryUnit?.data?.office?.email || 'N/A'}</div>
              </div>
            </div>
            {/* Responsibility Center */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Responsibility Center
                </div>
                <div>
                  {deliveryUnit?.data?.office?.responsibilityCenterCode ||
                    'N/A'}
                </div>
              </div>
            </div>
            {/* Organizational Cluster */}
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <div className="font-medium text-sm text-muted-foreground">
                  Organizational Cluster
                </div>
                <div>{deliveryUnit?.data?.cluster?.name || 'N/A'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-lg font-semibold mb-4"> Sub Delivery Units</div>
      {/* Sub Delivery Units Table */}
      <Card>
        <CardContent>
          <TemplateTable
            columns={SubDUColumn}
            data={deliveryUnit?.data?.subDeliveryUnits || []}
            actions={actions}
            readonly={false}
            toolbar={(table) => (
              <Toolbar
                table={table}
                deliveryUnitSearch={deliveryUnitSearch}
                parentId={deliveryUnitId}
              />
            )}
            fixedPageSize={11}
            meta={{ deliveryUnit: deliveryUnit?.data || [] }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default DeliveryUnitPage
