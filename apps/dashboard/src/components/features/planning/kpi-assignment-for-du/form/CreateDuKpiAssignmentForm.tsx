import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useForm, useStore  } from '@tanstack/react-form'

import { getDeliveryUnitsRequest } from '../../delivery-unit/handlers/getDeliveryUnitsRequest'
import { getKpisRequest } from '../../kpi/handlers/getKpisRequest'
import { getKpiTargetsRequest } from '../../kpi-target/handlers/getKpiTargetsRequest'
import {
  createKpiAssignmentSchema,
  defaultKpiAssignment,
  transformToSubmissionPayload
} from '../types/kpiAssignment.types'
import { useTargetSummaries } from './useTargetSummaries'
import KpiAssignmentCard from './KpiAssignmentCard'
import type { ApiKpiTarget, CreateKpiAssignmentFormValues, KpiAssignmentSubmissionPayload } from '../types/kpiAssignment.types';
import type { DeliveryUnit } from '../../delivery-unit'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
// import { useAppForm } from '@/hooks/demo.form'

export type { CreateKpiAssignmentFormValues } from '../types/kpiAssignment.types'
export { createKpiAssignmentSchema } from '../types/kpiAssignment.types'

// Export the transformed payload type for the API handler
export type CreateKpiAssignmentFormType = KpiAssignmentSubmissionPayload

export type FormType = ReturnType<typeof createFormFactory>

interface CreateKpiAssignmentFormProps {
  onSubmit: (data: KpiAssignmentSubmissionPayload) => void
  onCancel: (form: FormType) => void
  isLoading?: boolean
  initialValues?: Partial<CreateKpiAssignmentFormValues>
  disableDeliveryUnitSelect?: boolean
}

interface DuKpiAssignmentFormConfig {
  onSubmit: (data: CreateKpiAssignmentFormValues) => void
  initialValues?: Partial<CreateKpiAssignmentFormValues>
}
interface KpiWithAllocable {
  id: string
  name: string
  isTargetValueAllocable?: boolean
  remainingTargetValue?: number
}
const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest)
const useKpis = createQueryHookFromTemplate(getKpisRequest)
const useKpiTargets = createQueryHookFromTemplate(getKpiTargetsRequest)

const createFormFactory = ({ onSubmit, initialValues }: DuKpiAssignmentFormConfig) =>
  useForm({
    defaultValues: { ...defaultKpiAssignment, ...initialValues },
    validators: { onChange: createKpiAssignmentSchema },
    onSubmit: ({ value }) => onSubmit(value),
  })

export { useTargetSummaries } from './useTargetSummaries'

export default function CreateKpiAssignmentForm({ onSubmit, onCancel, isLoading = false, initialValues, disableDeliveryUnitSelect = false }: CreateKpiAssignmentFormProps) {
  const { data: deliveryUnits } = useDeliveryUnits({
    pathParams: {}, queryParams: {
      pageSize: 11000,
      filters: `parentId==null`,
    }
  })
  const { data: kpis } = useKpis({
    pathParams: {}, queryParams: {
      pageSize: 11000,
      filters: `parentKPIId==null`,
    }
  })
  const { data: allKpiTargets } = useKpiTargets({ pathParams: {}, queryParams: {} })
  const availableKpis = useMemo(() => {
    if (!kpis?.data || !allKpiTargets?.data) return (kpis?.data || []) as Array<KpiWithAllocable>
    return (kpis.data as Array<KpiWithAllocable>).filter((kpi) => {
      const targets = (allKpiTargets.data as Array<ApiKpiTarget>).filter((t) => (t.kpiId ?? t.kpi?.id) === kpi.id) 
      if (targets.length === 0) return true 
      return targets.some((t) => (t.remainingTargetValue ?? 0) > 0)
    })
  }, [kpis?.data, allKpiTargets?.data]) 
  const kpiAllocabilityMap = useMemo<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availableKpis.forEach((kpi) => { 
      map[kpi.id] = kpi.isTargetValueAllocable !== false
    })
    return map
  }, [availableKpis])


  const handleFormSubmit = useCallback((formValues: CreateKpiAssignmentFormValues) => {
    const payload = transformToSubmissionPayload(formValues)
    onSubmit(payload)
  }, [onSubmit])

  const form = createFormFactory({
    onSubmit: handleFormSubmit,
    initialValues: { deliveryUnitId: '', kpiTargets: [{ kpiId: '', allocations: [] }], ...initialValues }
  }) 
  const selectedKpiIdsMap = useStore(form.store, (state) => state.values.kpiTargets.reduce((acc: Record<string, string>, target, idx) => { if (target.kpiId) acc[idx] = target.kpiId; return acc; }, {}));
  const selectedKpiIds = Object.values(selectedKpiIdsMap);
  const { data: kpiTargets, isFetching: isFetchingKpiTargets } = useKpiTargets({
    pathParams: {},
    queryParams: {
      filters: Object.keys(selectedKpiIdsMap).length > 0 ? `kpiId==${Object.values(selectedKpiIdsMap).join('||')}` : '',
      pageSize: 10000,
    },
  })

  const targetSummaries = useTargetSummaries({
    selectedKpiIds: selectedKpiIdsMap,
    kpiTargets,
    kpiAllocabilityMap,
    form
  })
  return (
    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }} className="h-full flex flex-col">
      <div className='grid grid-cols-1 justify-evenly gap-4 min-h-[50vh]'>
        <div className="flex-1 h-full overflow-y-auto px-4">
          <form.Field name="deliveryUnitId">
            {(field) => (
              <div className="w-[45%]">
                <div className="space-y-2">
                  <Label htmlFor="deliveryUnitId" className="font-medium">Select Delivery Unit</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange} disabled={disableDeliveryUnitSelect}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select a Delivery Unit" /></SelectTrigger>
                    <SelectContent>
                      {deliveryUnits?.data.map((unit: DeliveryUnit) => (<SelectItem key={unit.id} value={unit.id}>{unit.officeName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>
          <form.Field name="kpiTargets" mode="array">
            {(arrayField) => (
              <div className="space-y-4">
                <div className="flex justify-end w-full pb-4">
                  <Button type="button" variant="outline" className="text-blue-700 border-blue-700 hover:bg-blue-500/10"
                    onClick={() => arrayField.pushValue({ kpiId: '', allocations: [] })}>
                    <Plus className="h-4 w-4 mr-2" />Add KPI
                  </Button>
                </div>
                {arrayField.state.value.map((assignment, idx) => (
                  <KpiAssignmentCard
                    key={idx}
                    assignmentIndex={idx}
                    kpiId={assignment.kpiId}
                    canRemove={arrayField.state.value.length > 1}
                    onRemove={() => {
                      arrayField.removeValue(idx)
                    }}
                    availableKpis={availableKpis.filter(kpi => !selectedKpiIds.includes(kpi.id) || kpi.id === assignment.kpiId)}
                    targetSummaries={targetSummaries[idx] ?? []}
                    isFetchingTargets={isFetchingKpiTargets}
                    form={form}
                  />
                ))}
              </div>
            )}
          </form.Field>

        </div>
      </div>
      <div className="h-20 sticky bottom-0 right-0 flex justify-end items-center gap-3 pt-4 pb-4 pr-4 border-t bg-white  border-gray-200">
        <Button type="button" variant="outline" onClick={() => onCancel(form)} disabled={isLoading} className="min-w-24">Cancel</Button>
        <Button type="submit" className="bg-(--submit-button-green)" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Assign KPI'}
        </Button>
      </div>
    </form>
  )
}