import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getClustersRequest } from '../handlers/getClustersRequest'
import { getOfficesRequest } from '../handlers/getOfficesRequest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  form: any
}

const useClusters = createQueryHookFromTemplate(getClustersRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

export default function ClusterAndDeliveryUnitSection({ form }: Props) {
  const { data: clustersData, isLoading: clustersLoading } = useClusters({
    pathParams: {},
    queryParams: {},
  })
  const { data: officesData, isLoading: officesLoading } = useOffices({
    pathParams: {},
    queryParams: {},
  })

  const clusters = clustersData?.data ?? []
  const offices = officesData?.data ?? []

  return (
    <div className="space-y-6">
      {/* Organizational Cluster */}
      <form.Field
        name="clusterId"
        children={(field: any) => (
          <div className="grid gap-2">
            <Label>Organizational Cluster</Label>
            <Select
              value={
                typeof field.state.value === 'string' && field.state.value !== ''
                  ? field.state.value
                  : ''
              }
              onValueChange={(v) => field.handleChange(v === '' ? null : v)}
              disabled={clustersLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={clustersLoading ? 'Loading...' : 'Select Organizational Cluster (optional)'}
                />
              </SelectTrigger>
              <SelectContent>
                {clusters.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!clustersLoading && clusters.length === 0 && (
              <p className="text-xs text-muted-foreground">No clusters found</p>
            )}
          </div>
        )}
      />

      {/* Parent Office */}
      <form.Field
        name="parentId"
        children={(field: any) => (
          <div className="grid gap-2">
            <Label>Parent Office</Label>
            <Select
              value={
                typeof field.state.value === 'string' && field.state.value !== ''
                  ? field.state.value
                  : ''
              }
              onValueChange={(v) => field.handleChange(v === '' ? null : v)}
              disabled={officesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={officesLoading ? 'Loading...' : 'Select Parent Office (optional)'}
                />
              </SelectTrigger>
              <SelectContent>
                {offices.map((o: any) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name} ({o.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!officesLoading && offices.length === 0 && (
              <p className="text-xs text-muted-foreground">No offices found — this will be a root office</p>
            )}
          </div>
        )}
      />
    </div>
  )
}
