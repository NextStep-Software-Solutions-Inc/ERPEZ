/**
 * Edit KPI Form
 * Step 2: KPI Activation - Form for editing KPI configuration
 * 
 * Follows TanStack Form + Zod pattern from CreateKpiForm
 * Uses API payload structure for PUT /fy-active-kpis/{id}
 */

import { useForm } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { getSdgsRequest, type SDG } from '../handlers/getSdgsRequest'
import { getAttributesRequest, type Attribute } from '../handlers/getAttributesRequest'
import { getFYActiveKpiByIdRequest } from '../handlers/getFYActiveKpiByIdRequest'
import { MeasurementUnitSelect } from '@/features/planning/master-kpi/components/MeasurementUnitSelect'
import { LabelWithInfo } from '@/components/LabelWithInfo'




const useSdgs = createQueryHookFromTemplate(getSdgsRequest)
const useAttributes = createQueryHookFromTemplate(getAttributesRequest)
const useGetFYActiveKpiById = createQueryHookFromTemplate(getFYActiveKpiByIdRequest)

// Schema matching the API PUT payload
export const editKpiFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  measurementUnit: z.string().optional(),
  distributionBehavior: z.string().optional(),
  functionCategory: z.string().optional(),
  monitoringFrequency: z.string().optional(),
  isOptInAvailable: z.boolean().default(false),
  isGAD: z.boolean().default(false),
  status: z.string().optional(),
  mfopapId: z.string().optional(),
  SDGIds: z.array(z.string()).default([]),
  AttributeIds: z.array(z.string()).default([]),
})

export type EditKpiFormValues = z.infer<typeof editKpiFormSchema>

interface EditKpiFormProps {
  kpiId: string
  onSubmit: (data: EditKpiFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function EditKpiForm({
  kpiId,
  onSubmit,
  onCancel,
  isLoading = false,
}: EditKpiFormProps) {
  // Track if any field has been modified
  const [isDirty, setIsDirty] = useState(false)

  // Fetch the actual KPI data from the API
  const { data: kpiResponse, isLoading: isLoadingKpi } = useGetFYActiveKpiById({
    pathParams: { id: kpiId },
    queryParams: {},
  })

  const kpiData = kpiResponse?.data

  const { data: sdgsResponse } = useSdgs({ pathParams: {}, queryParams: { pageSize: 50, PageSize: 50 } })

  const { data: attributesResponse } = useAttributes({ pathParams: {}, queryParams: {} })

  const sdgs: SDG[] = sdgsResponse?.data || []
  const attributes: Attribute[] = attributesResponse?.data || []

  // Create form using TanStack Form
  const form = useForm({
    defaultValues: {
      name: kpiData?.name || '',
      code: kpiData?.code || '',
      description: kpiData?.description || '',
      measurementUnit: kpiData?.measurementUnit || '',
      distributionBehavior: kpiData?.distributionBehavior || 'Summation',
      functionCategory: kpiData?.functionCategory || 'Core',
      monitoringFrequency: kpiData?.monitoringFrequency || 'Quarterly',
      isOptInAvailable: kpiData?.isOptInAvailable || false,
      isGAD: kpiData?.isGAD || false,
      status: kpiData?.status || 'Active',
      mfopapId: kpiData?.mfopapId || '',
      SDGIds: (kpiData?.sdGs || kpiData?.sdgs || (kpiData as any)?.SDGs)?.map((s: any) => s.id) || [],
      AttributeIds: (kpiData?.attributes || (kpiData as any)?.Attributes)?.map((a: any) => a.id) || [],
    },
    onSubmit: async ({ value }) => {
      try {
        onSubmit(value)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    },
  })

  // Sync form state when kpiData finishes loading asynchronously
  useEffect(() => {
    if (kpiData) {
      const unit = kpiData.measurementUnit || (kpiData as any)?.unitOfMeasure || ''
      const behavior = kpiData.distributionBehavior || (kpiData as any)?.aggregationMethod || 'Summation'
      const funcCat = kpiData.functionCategory || (kpiData as any)?.functionType || 'Core'
      const freq = kpiData.monitoringFrequency || 'Quarterly'

      form.setFieldValue('name', kpiData.name || '')
      form.setFieldValue('code', kpiData.code || '')
      form.setFieldValue('description', kpiData.description || '')
      form.setFieldValue('measurementUnit', unit)
      form.setFieldValue('distributionBehavior', behavior)
      form.setFieldValue('functionCategory', funcCat)
      form.setFieldValue('monitoringFrequency', freq)
      form.setFieldValue('isOptInAvailable', kpiData.isOptInAvailable || false)
      form.setFieldValue('isGAD', kpiData.isGAD || false)
      form.setFieldValue('status', kpiData.status || 'Active')
      form.setFieldValue('mfopapId', kpiData.mfopapId || '')
      form.setFieldValue('SDGIds', (kpiData.sdGs || kpiData.sdgs || (kpiData as any)?.SDGs)?.map((s: any) => s.id) || [])
      form.setFieldValue('AttributeIds', (kpiData.attributes || (kpiData as any)?.Attributes)?.map((a: any) => a.id) || [])
    }
  }, [kpiData])


  // Mark form as dirty when any field changes
  const markDirty = () => {
    setIsDirty(true)
  }

  const handleCancel = () => {
    onCancel()
  }

  if (isLoadingKpi) {
    return (
      <div className="space-y-6 max-h-[80vh] overflow-y-auto flex items-center justify-center py-20 [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500">Loading KPI data...</p>
        </div>
      </div>
    )
  }

  if (!kpiData) {
    return (
      <div className="space-y-6 max-h-[80vh] overflow-y-auto flex items-center justify-center py-20 [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
        <p className="text-red-500">Failed to load KPI data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Basic Information Section */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-900">Basic Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Name Field */}
            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <Input
                    type="text"
                    value={String(field.state.value || kpiData.name || '')}
                    onChange={(e) => {
                      form.setFieldValue('name', e.target.value)
                      markDirty()
                    }}
                    placeholder="Enter KPI name"
                    className="text-sm"
                  />
                </div>
              )}
            />

            {/* Code Field */}
            <form.Field
              name="code"
              children={(field) => (
                <div>
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <Input
                    type="text"
                    value={String(field.state.value || kpiData.code || '')}
                    onChange={(e) => {
                      form.setFieldValue('code', e.target.value)
                      markDirty()
                    }}
                    placeholder="Enter KPI code"
                    className="text-sm"
                  />
                </div>
              )}
            />
          </div>

          {/* Description Field */}
          <form.Field
            name="description"
            children={(field) => (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={String(field.state.value || kpiData.description || '')}
                  onChange={(e) => {
                    form.setFieldValue('description', e.target.value)
                    markDirty()
                  }}
                  placeholder="Enter KPI description"
                  rows={3}
                  className="text-sm"
                />
              </div>
            )}
          />
        </div>

        {/* KPI Attributes Section */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-900">KPI Attributes</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Measurement Unit */}
            <form.Field
              name="measurementUnit"
              children={(field) => {
                const valueToUse = String(field.state.value || kpiData.measurementUnit || (kpiData as any)?.unitOfMeasure || '')
                return (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Measurement Unit</label>
                    <MeasurementUnitSelect
                      value={valueToUse}
                      onChange={(val) => {
                        form.setFieldValue('measurementUnit', val)
                        markDirty()
                      }}
                    />
                  </div>
                )
              }}
            />


            {/* Distribution Behavior */}
            <form.Field
              name="distributionBehavior"
              children={(field) => {
                const rawVal = String(field.state.value || kpiData.distributionBehavior || (kpiData as any)?.aggregationMethod || '')
                let mappedVal = rawVal
                const upper = rawVal.toUpperCase()
                if (upper === 'SUM' || upper === 'SUMMATION') mappedVal = 'Summation'
                else if (upper === 'UNIFORM' || upper === 'AVERAGE') mappedVal = 'Uniform'
                else if (upper === 'MAXIMUM' || upper === 'MAX') mappedVal = 'Maximum'
                else if (upper === 'MINIMUM' || upper === 'MIN') mappedVal = 'Minimum'
                else if (upper === 'MILESTONE' || upper === 'NON_CUMULATIVE') mappedVal = 'Milestone'

                return (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Distribution Behavior</label>
                    <Select
                      value={mappedVal}
                      onValueChange={(value: string) => {
                        form.setFieldValue('distributionBehavior', value as any)
                        markDirty()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select behavior" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Summation">Summation</SelectItem>
                        <SelectItem value="Uniform">Uniform</SelectItem>
                        <SelectItem value="Maximum">Maximum</SelectItem>
                        <SelectItem value="Minimum">Minimum</SelectItem>
                        <SelectItem value="Milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Function Category */}
            <form.Field
              name="functionCategory"
              children={(field) => {
                const rawVal = String(field.state.value || kpiData.functionCategory || (kpiData as any)?.functionType || '')
                let mappedVal = rawVal
                const upper = rawVal.toUpperCase()
                if (upper.includes('CORE')) mappedVal = 'Core'
                else if (upper.includes('SUPPORT')) mappedVal = 'Support'
                else if (upper.includes('STRATEGIC')) mappedVal = 'Strategic'

                return (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Function Category</label>
                    <Select
                      value={mappedVal}
                      onValueChange={(value: string) => {
                        form.setFieldValue('functionCategory', value as any)
                        markDirty()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Strategic">Strategic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              }}
            />

            {/* Monitoring Frequency */}
            <form.Field
              name="monitoringFrequency"
              children={(field) => {
                const rawVal = String(field.state.value || kpiData.monitoringFrequency || 'Quarterly')
                let mappedVal = rawVal
                const upper = rawVal.toUpperCase()
                if (upper.includes('MONTH')) mappedVal = 'Monthly'
                else if (upper.includes('QUARTER')) mappedVal = 'Quarterly'
                else if (upper.includes('SEMESTER') || upper.includes('SEMI')) mappedVal = 'Semi-Annual'
                else if (upper.includes('ANNUAL') || upper.includes('YEAR')) mappedVal = 'Annual'

                return (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Monitoring Frequency</label>
                    <Select
                      value={mappedVal}
                      onValueChange={(value: string) => {
                        form.setFieldValue('monitoringFrequency', value as any)
                        markDirty()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              }}
            />
          </div>
        </div>


        {/* Flags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender & Development (GAD) */}
          <form.Field
            name="isGAD"
            children={(field) => (
              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card hover:bg-muted/30 transition-all shadow-sm">
                <LabelWithInfo
                  label="Gender & Development (GAD)"
                  tooltip="Indicates if this KPI supports gender-responsive planning and monitoring."
                  htmlFor="isGAD"
                  className="mb-0 cursor-pointer text-sm font-medium text-gray-800"
                />
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    form.setFieldValue('isGAD', Boolean(checked))
                    markDirty()
                  }}
                  id="isGAD"
                />
              </div>
            )}
          />

          {/* Available for Opt-in */}
          <form.Field
            name="isOptInAvailable"
            children={(field) => (
              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card hover:bg-muted/30 transition-all shadow-sm">
                <LabelWithInfo
                  label="Available for Opt-in"
                  tooltip="Allows other offices to select and adopt this KPI for their own performance monitoring."
                  htmlFor="isOptInAvailable"
                  className="mb-0 cursor-pointer text-sm font-medium text-gray-800"
                />
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    form.setFieldValue('isOptInAvailable', Boolean(checked))
                    markDirty()
                  }}
                  id="isOptInAvailable"
                />
              </div>
            )}
          />
        </div>


        {/* SDGs Selection Section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-green-900">Sustainable Development Goals (SDGs)</h4>
          </div>
          
          {(form.Field as any)(
            {
              name: "SDGIds",
              children: (field: any) => {
                const sdgIds = ((field.state.value as unknown) as string[]) || []
                return (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1.5 rounded-md">
                    {sdgs.length === 0 ? (
                      <p className="text-sm text-gray-500">No SDGs available</p>
                    ) : (
                      sdgs.map((sdg) => (
                        <div key={sdg.id} className="flex items-start space-x-2 p-2 border rounded-md bg-white hover:bg-gray-50">
                          <Checkbox
                            checked={sdgIds.includes(sdg.id)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...sdgIds, sdg.id]
                                : sdgIds.filter((id: string) => id !== sdg.id)
                              form.setFieldValue('SDGIds' as any, newValue as any)
                              markDirty()
                            }}
                            id={`sdg-${sdg.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`sdg-${sdg.id}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer block"
                            >
                              {sdg.code}: {sdg.name}
                            </label>
                            {sdg.description && (
                              <p className="text-xs text-gray-500 mt-1">{sdg.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              }
            }
          )}
        </div>

        {/* Attributes Selection Section */}
        <div className="space-y-4 p-4 bg-purple-50 rounded-md border border-purple-200">
          <h4 className="font-semibold text-sm text-purple-900">Attributes</h4>
          
          {(form.Field as any)(
            {
              name: "AttributeIds",
              children: (field: any) => {
                const attrIds = ((field.state.value as unknown) as string[]) || []
                const selectedAttrId = attrIds[0] || ''
                return (
                  <div className="max-h-60 overflow-y-auto pr-1.5 rounded-md">
                    {attributes.length === 0 ? (
                      <p className="text-sm text-gray-500">No attributes available</p>
                    ) : (
                      <RadioGroup
                        value={selectedAttrId}
                        onValueChange={(value) => {
                          form.setFieldValue('AttributeIds' as any, value ? [value] : [])
                          markDirty()
                        }}
                        className="space-y-3"
                      >
                        {attributes.map((attribute) => (
                          <div key={attribute.id} className="flex items-start space-x-2 p-2 border rounded-md bg-white hover:bg-gray-50">
                            <RadioGroupItem
                              value={attribute.id}
                              id={`attr-${attribute.id}`}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={`attr-${attribute.id}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer block"
                              >
                                {attribute.code}: {attribute.name}
                              </label>
                              {attribute.description && (
                                <p className="text-xs text-gray-500 mt-1">{attribute.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                )
              }
            }
          )}
        </div>



        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isDirty}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
