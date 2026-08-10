import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getClustersRequest } from '../office/handlers/getClustersRequest'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  form: any
}

const useClusters = createQueryHookFromTemplate(getClustersRequest)

export default function ClusterAndDeliveryUnitSection({ form }: Props) {
  const { data: clustersData, isLoading } = useClusters({
    pathParams: {},
    queryParams: {},
  })

  const clusters = clustersData?.data ?? []

  return (
    <div className="space-y-6 md:grid md:grid-cols-2 md:gap-1 md:space-y-0">
      {/* Organizational Cluster */}
      <form.Field
        name="clusterId"
        children={(field: any) => (
          <div className="w-full">
            <label className="font-medium">Organizational Cluster</label>
            <Select
              value={
                typeof field.state.value === 'string' &&
                field.state.value !== ''
                  ? field.state.value
                  : ''
              }
              onValueChange={(v) => field.handleChange(v === '' ? null : v)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading ? 'Loading...' : 'Select Organizational Cluster'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clusters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoading && clusters.length === 0 && (
              <p className="text-xs text-muted-foreground">No clusters found</p>
            )}
          </div>
        )}
      />

      {/* Delivery Unit */}
      <form.Field
        name="isDeliveryUnit"
        children={(field: any) => (
          <div className="flex items-center gap-2 w-full">
            <Checkbox
              checked={!!field.state.value}
              onCheckedChange={(v) => field.handleChange(Boolean(v))}
            />
            <label className="font-medium">
              Delivery Unit <span className="text-destructive">*</span>
            </label>
          </div>
        )}
      />
    </div>
  )
}
